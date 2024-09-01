import React, { useState, useEffect } from 'react';
import {
    AreaChart as RechartsAreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import Dropdown from '../../components/ui/Dropdown';
import axiosUtils from '../../../../utils/axiosUtils';

const AreaChart = () => {
    const [selectedOption, setSelectedOption] = useState('Day');
    const [chartData, setChartData] = useState([]);

    const fetchData = async () => {
        try {
            const response = await axiosUtils(`/api/get-visits-data?filter=${selectedOption}`, 'GET');
            const formattedData = response.data.map(visit => ({
                name: visit.label, // Adjusted from visit_time to label
                visits: visit.visits,
            }));
            setChartData(formattedData);
        } catch (error) {
            console.error('Error fetching chart data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedOption]);

    // Custom tick formatter to only display labels divisible by 6
    const customTickFormatter = (tick) => {
        if (selectedOption === 'Day') {
            return tick % 6 === 0 ? tick : '';
        } else if (selectedOption === 'Month') {
            return tick % 6 === 0 ? tick : '';
        }
        return tick;
    };

    return (
        <div style={{ width: '100%' }} className="bg-[#fafcf8] p-4 mt-4 rounded-lg space-y-4 drop-shadow">
            <div className="flex justify-between items-center">
                <p className="text-md font-semibold">Visits</p>
                <Dropdown selectedOption={selectedOption} onOptionSelect={setSelectedOption} />
            </div>
            <ResponsiveContainer width="100%" height={200}>
                <RechartsAreaChart
                    width={500}
                    height={200}
                    data={chartData}
                    syncId="anyId"
                    margin={{
                        top: 10,
                        right: 0,
                        left: -15,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        horizontal={true}
                    />
                    <XAxis dataKey="name" tickFormatter={customTickFormatter} />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="visits" stroke="#8884d8" fill="#8884d8" />
                </RechartsAreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AreaChart;
