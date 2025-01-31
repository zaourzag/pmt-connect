
const http = require('@aero/http');
const { reqauth, getDate } = require("./util");
require('dotenv').config()
let authDetails = reqauth();

async function getEmployees(date) {
    let authDetails = await reqauth();
    let api_url = process.env.BASE_URL + "/api/v2/stores/554/employees";
    let week = getDate(date);
    let map = {};

    try {
        const res = await http(api_url, { authDetails })
            .query("exchange", true)
            .query("limit", 10000)
            .query("week", week)
            .header(authDetails)
            .json();

        let employees = res.result;

        for (const employee of employees) {
            map[employee.account_id] = employee;
        }
        return map;
    } catch (error) {
        console.error("Error fetching employees:", error);
        throw error;
    }
}

async function afdelingen(week) {
    let authDetails = await reqauth();
    let map = {};
    let ids = [];
    const resp = await http(process.env.BASE_URL + "/api/v2/departments", { authDetails }).header(authDetails)
        .query("date", week)
        .json()
        .then((res) => {


            let arr = JSON.parse(JSON.stringify(res.result));


            let b = [];



            for (const afdeling of arr) {
                const id = Number.parseInt(afdeling.department_id);
                // console.log(afdeling)
                // map[].push
                map[id] = afdeling.department_name;
                ids.push(id)


            }


            return map;

        });

    let arr = [
        map,
        ids
    ]
    return arr;
};

async function shifts(dag) {
    authDetails = await reqauth();
    let api_url = process.env.BASE_URL + "/api/v2/shifts";
    const deps = await afdelingen(dag);
    const dep_ids = deps[1].toString();

    const medewerkers = await getEmployees(dag);
    const hours = await http(api_url, { authDetails })

        //https://ahwaalwijk.personeelstool.nl/api/v2/shifts?date=2024-08-10&ignore_lent_out=false&account_id[neq]=288576&department_id=91,404,81,82,72", { authDetails})
        .query("date", dag)
        .query("ignore_lent_out", false)
        .query("account_id[neq]", 288576)
        .query("department_id", dep_ids)
        .header(authDetails)
        .json();

    const shifts = hours.result.map(shift => {
        const employee = medewerkers[shift.account_id];
        const afdeling = deps[0][shift.department_id];
        return {
            start_datetime: shift.start_datetime,
            end_datetime: shift.end_datetime,
            duration: shift.duration,
            afdeling: afdeling ? afdeling : shift.department_id,
            account_id: shift.account_id,
            username: employee ? employee.name : 'Unknown',
            remark: shift.remark,
            status: shift.status
        };
    });
    return shifts
}
module.exports = {
    getEmployees,
    shifts
};
