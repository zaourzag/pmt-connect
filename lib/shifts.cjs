const http = require('@aero/http');
const { reqauth, getDate } = require("./util");
require('dotenv').config();

async function getEmployees(date) {
    let authDetails = await reqauth();
    let api_url = `${process.env.BASE_URL}/api/v2/stores/554/employees`;
    let week = getDate(date);
    let map = {};

    try {
        const res = await http(api_url, { authDetails })
            .query("exchange", true)
            .query("limit", 10000)
            .query("week", week)
            .header(authDetails)
            .json();

        for (const employee of res.result) {
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

    try {
        const res = await http(`${process.env.BASE_URL}/api/v2/departments`, { authDetails })
            .query("date", week)
            .header(authDetails)
            .json();

        for (const afdeling of res.result) {
            const id = Number.parseInt(afdeling.department_id);
            map[id] = afdeling.department_name;
            ids.push(id);
        }

        return [map, ids];
    } catch (error) {
        console.error("Error fetching departments:", error);
        throw error;
    }
}

async function shifts(dag) {
    let authDetails = await reqauth();
    let api_url = `${process.env.BASE_URL}/api/v2/shifts`;

    try {
        const deps = await afdelingen(dag);
        const dep_ids = deps[1].join(",");
        const medewerkers = await getEmployees(dag);

        const hours = await http(api_url, { authDetails })
            .query("date", dag)
            .query("ignore_lent_out", false)
            .query("account_id[neq]", 288576)
            .query("department_id", dep_ids)
            .header(authDetails)
            .json();

        return hours.result.map(shift => {
            const employee = medewerkers[shift.account_id];
            return {
                start_datetime: shift.start_datetime,
                end_datetime: shift.end_datetime,
                duration: shift.duration,
                afdeling: deps[0][shift.department_id] || shift.department_id,
                account_id: shift.account_id,
                username: employee ? employee.name : 'Unknown',
                remark: shift.remark,
                status: shift.status
            };
        });
    } catch (error) {
        console.error("Error fetching shifts:", error);
        throw error;
    }
}

module.exports = {
    getEmployees,
    shifts
};
