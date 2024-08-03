import React, { useState } from 'react';
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
import { dayData, weekData, monthData, yearData } from '../../data/Data';

const AreaChart = () => {
    const [selectedOption, setSelectedOption] = useState('Day');

    const getData = () => {
        switch (selectedOption) {
            case 'Day':
                return dayData;
            case 'Week':
                return weekData;
            case 'Month':
                return monthData;
            case 'Year':
                return yearData;
            default:
                return dayData;
        }
    };

    // Custom function to filter labels based on interval
    const customTickFormatter = (value, index, array) => {
        if (selectedOption === 'Day') {
            const hour = parseInt(value.split(':')[0], 10);
            // Display labels only for hours divisible by 6
            return hour % 6 === 0 ? value : '';
        }else if (selectedOption === 'Month') {
            const hour = parseInt(value);
            // Display labels only for hours divisible by 6
            return hour % 6 === 0 ? value : '';
        }

        // For other options, show all labels
        return value;
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
                    data={getData()}
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
                        vertical={false} // Hide vertical grid lines
                        horizontal={true} // Show horizontal grid lines
                    />
                    <XAxis
                        dataKey="name"
                        tickFormatter={customTickFormatter}
                        interval={0} // Ensure all labels are processed for formatting
                    />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="visits" stroke="#8884d8" fill="#8884d8" />
                </RechartsAreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AreaChart;
