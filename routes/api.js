const fs = require('fs');
const router = require('express').Router();
const shift = require('../lib/shifts.cjs');

const request = require("@aero/http");
// const { reqauth} = require('../lib/util');
const {getDate: week} = require('../lib/util');
const AUTH_URL = process.env.BASE_URL + "/pmtLoginSso";
let authDetails = {
    context_token: "",
    user_token: ""
};
// test2()
let testing = week("2025-02-10")
console.log(testing)

// console.log(employeeMap);
// console.log(employees)
const { BASE_URL, PMTUSERNAME, PASSWORD, ACCOUNTID } = process.env;
// console.log(process.env.PMTUSERNAME)
// console.log(process.env.PASSWORD)
let authReqJson = {
    username: process.env.PMTUSERNAME,
    password: process.env.PASSWORD,
    browser_info: {
        os_name: "Windows 10",
        browser_name: "Chrome",
        browser_version: 131,
        screen_resolution: "2304.4500406980515x1440.4500254392624"
    }
}
// console.log(AUTH_URL)
async function test() {
    const result = await request(process.env.BASE_URL + "/api/v2/me", { authDetails }).undici().get();
    // console.log(result)
    return result;

}
let runamount = 0;
// console.log(test())
async function reqauth() {
    // test();
    if (await test().statusCode !== 200) {
        await request(AUTH_URL).post().body(authReqJson).json()
            .then((res) => {
                // console.log(res);

                authDetails = {
                    "x-api-context": res.result.context_token,
                    "x-api-user": res.result.user_token
                };
                // console.log(authDetails)
            })


    }

    runamount++;
    console.log(`executed ${runamount} times`)
    return authDetails;
}

router.get('/', async function (req, res, next) {
    const { dateFrom, dateTo } = req.query;
    await reqauth();
    // console.log(dateFrom, dateTo);






    // console.log(headers)
    //https://ahwaalwijk.personeelstool.nl/api/v2/shifts?date=2025-02-03&ignore_lent_out=true&account_id[neq]=285127&department_id=81,82,81,82
    // const hours = await request(process.env.BASE_URL + "/api/v2/payrollDetails/totals", { authDetails})
    const hours = await request(process.env.BASE_URL + "/api/v2/shifts?date=2025-01-29&ignore_lent_out=true&account_id[neq]=285127&department_id=404,82,404,82", { authDetails })

        // .query("date[gte]", dateFrom)
        // .query("date[lte]", dateTo)
        // .query("a", ACCOUNTID)
        .header(authDetails)
        .json()
    // .then((res) => {
    //     console.log(JSON.stringify(res.result).period_totals);
    //     return res.result[0].period_totals;
    // });


    // console.log(hours)
    res.json(hours);
});

router.get('/shifts', async (req, res) => {
    let date = (req.query.date ?? "2025-02-10");
let shifts = await shift.shifts(date)

    let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
        <title>Shifts</title>
        <style>
            th.sortable:hover {
                cursor: pointer;
                background-color: #f1f1f1;
            }
        </style>
    </head>
    <body>
    <div class="container mt-5">
        <h2 class="mb-4">Shifts</h2>
        <input class="form-control mb-4" id="tableSearch" type="text" placeholder="Search...">
        <table class="table table-bordered table-striped">
            <thead class="thead-dark">
                <tr>
                    <th class="sortable" data-sort="start_datetime">Start DateTime</th>
                    <th class="sortable" data-sort="end_datetime">End DateTime</th>
                    <th class="sortable" data-sort="duration">Duration</th>
                    <th class="sortable" data-sort="afdeling">Afdeeling</th>
                    <th class="sortable" data-sort="account_id">Account ID</th>
                    <th class="sortable" data-sort="username">Username</th>
                    <th class="sortable" data-sort="remark">Remark</th>
                    <th class="sortable" data-sort="status">Status</th>
                </tr>
            </thead>
            <tbody id="shiftsTableBody">`;

    shifts.forEach(shift => {
        html += `
                <tr>
                    <td>${shift.start_datetime}</td>
                    <td>${shift.end_datetime}</td>
                    <td>${shift.duration}</td>
                    <td>${shift.afdeling}</td>
                    <td>${shift.account_id}</td>
                    <td>${shift.username}</td>
                    <td>${shift.remark}</td>
                    <td>${shift.status}</td>
                </tr>`;
    });

    html += `
            </tbody>
        </table>
    </div>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const tableSearch = document.getElementById('tableSearch');
            const tableBody = document.getElementById('shiftsTableBody');
            const tableHeaders = document.querySelectorAll('th.sortable');

            tableSearch.addEventListener('keyup', function() {
                const filter = tableSearch.value.toLowerCase();
                const rows = tableBody.getElementsByTagName('tr');
                Array.from(rows).forEach(row => {
                    const cells = row.getElementsByTagName('td');
                    let match = false;
                    Array.from(cells).forEach(cell => {
                        if (cell.textContent.toLowerCase().includes(filter)) {
                            match = true;
                        }
                    });
                    row.style.display = match ? '' : 'none';
                });
            });

            tableHeaders.forEach(header => {
                header.addEventListener('click', function() {
                    const sortKey = header.getAttribute('data-sort');
                    const rows = Array.from(tableBody.getElementsByTagName('tr'));
                    const sortedRows = rows.sort((a, b) => {
                        const aText = a.querySelector("td:nth-child(" + (header.cellIndex + 1) + ")").textContent;
                        const bText = b.querySelector("td:nth-child(" + (header.cellIndex + 1) + ")").textContent;
                        if (sortKey === 'start_datetime' || sortKey === 'end_datetime') {
                            return new Date(aText) - new Date(bText);
                        }
                        return aText.localeCompare(bText);
                    });
                    tableBody.innerHTML = '';
                    sortedRows.forEach(row => tableBody.appendChild(row));
                });
            });
        });
    </script>
    </body>
    </html>`;

    res.send(html);
});

module.exports = router;