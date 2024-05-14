import React, { useState, useEffect, useMemo } from 'react';
import AuthResultsChart from '@src/components/PieCharts'; // Suponiendo que tienes un componente para los gráficos
import { getDmarcReportsByDateRange } from '@src/hooks/dmarcReports.js'; // Suponiendo que tienes una función para obtener los reportes
import { DmarcReportsTable } from '@src/components/Tables';

function ReportsByDate() {
    // Date handling
    const [endDate, setEndDate] = useState(new Date());
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 31)));

    // Report handling
    const [loading, setLoading] = useState(false);
    const [reports, setReports] = useState([]);
    const [records, setRecords] = useState([]);

    // Fetch reports based on date range
    useEffect(() => {
        setLoading(true);
        async function fetchReports() {
            const response = await getDmarcReportsByDateRange(startDate, endDate);
            setReports(response.data);
            setLoading(false);
        }
        fetchReports();
    }, [startDate, endDate]);

    // Convert reports to records format for table and charts
    useEffect(() => {
        if (reports.length > 0) {
            const newRecords = [];
            reports.forEach((report, index) => {
                report.record.forEach((record, recordIndex) => {
                    newRecords.push({
                        id: `${index}-${recordIndex}`, 
                        sourceIP: record.row.source_ip,
                        count: record.row.count,
                        policyEvaluated: record.row.policy_evaluated,
                        identifiers: record.identifiers,
                        authResults: record.auth_results
                    });
                });
            });
            setRecords(newRecords);
        }
    }, [reports]);

    // Handler for date change
    const handleStartDateChange = (event) => {
        setStartDate(new Date(event.target.value));
    };

    const handleEndDateChange = (event) => {
        setEndDate(new Date(event.target.value));
    };

    return (
        <div className='flex flex-row items-start p-6 gap-5 justify-between w-screen'>
            <div className="flex flex-col h-screen w-2/3">
                <h1 className='text-4xl font-bold'>Reports by Date</h1>
                <div className='flex flex-row gap-5 justify-between my-3'>
                    <input type='date' className='bg-gray-800 px-3 py-2 rounded-xl' value={startDate.toISOString().split('T')[0]} onChange={handleStartDateChange} />
                    <input type='date' className='bg-gray-800 px-3 py-2 rounded-xl' value={endDate.toISOString().split('T')[0]} onChange={handleEndDateChange} />
                </div>
                <div className="flex">
                    <DmarcReportsTable reportsData={reports}/>
                </div>
            </div>
            <div className='flex flex-col w-1/2 gap-5'>
                <AuthResultsChart records={records} type='dkim' />
                <AuthResultsChart records={records} type='spf' />
            </div>

        </div>
    );
}

export default ReportsByDate;