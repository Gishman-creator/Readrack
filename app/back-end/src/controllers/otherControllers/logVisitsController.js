const pool = require('../../config/db');

exports.logVisit = async (req, res) => {
    const { pageVisited, sessionId } = req.body;

    try {
        await pool.query(
            'INSERT INTO visits (session_id, page_visited, user_agent, ip_address) VALUES (?, ?, ?, ?)',
            [sessionId, pageVisited, req.get('User-Agent'), req.ip]
        );
        res.status(200).send('Visit logged successfully');
    } catch (error) {
        console.error('Error logging visit:', error);
        res.status(500).send('Error logging visit');
    }
};

exports.getVisitsData = async (req, res) => {
    const { filter } = req.query;
    let query = '';
    let labels = [];

    if (filter === 'Day') {
        // Generate all 24 hours
        labels = Array.from({ length: 24 }, (_, i) => ({ label: i, visits: 0 }));

        query = `SELECT HOUR(visit_time) AS label, COUNT(*) AS visits 
                 FROM visits 
                 WHERE visit_time >= CURDATE() 
                 GROUP BY label`;
    } else if (filter === 'Week') {
        // Generate all days of the week
        labels = [
            { label: 'Monday', visits: 0 },
            { label: 'Tuesday', visits: 0 },
            { label: 'Wednesday', visits: 0 },
            { label: 'Thursday', visits: 0 },
            { label: 'Friday', visits: 0 },
            { label: 'Saturday', visits: 0 },
            { label: 'Sunday', visits: 0 },
        ];

        query = `SELECT DAYNAME(visit_time) AS label, COUNT(*) AS visits 
                 FROM visits 
                 WHERE YEARWEEK(visit_time, 1) = YEARWEEK(CURDATE(), 1)
                 GROUP BY label`;
    } else if (filter === 'Month') {
        // Generate all days of the month (1 to 31)
        labels = Array.from({ length: 31 }, (_, i) => ({ label: i + 1, visits: 0 }));

        query = `SELECT DAY(visit_time) AS label, COUNT(*) AS visits 
                 FROM visits 
                 WHERE YEAR(visit_time) = YEAR(CURDATE()) AND MONTH(visit_time) = MONTH(CURDATE())
                 GROUP BY label`;
    } else if (filter === 'Year') {
        // Generate all months of the year
        labels = [
            { label: 'January', visits: 0 },
            { label: 'February', visits: 0 },
            { label: 'March', visits: 0 },
            { label: 'April', visits: 0 },
            { label: 'May', visits: 0 },
            { label: 'June', visits: 0 },
            { label: 'July', visits: 0 },
            { label: 'August', visits: 0 },
            { label: 'September', visits: 0 },
            { label: 'October', visits: 0 },
            { label: 'November', visits: 0 },
            { label: 'December', visits: 0 },
        ];

        query = `SELECT MONTHNAME(visit_time) AS label, COUNT(*) AS visits 
                 FROM visits 
                 WHERE YEAR(visit_time) = YEAR(CURDATE())
                 GROUP BY label`;
    }

    try {
        const [results] = await pool.query(query);

        // Merge results with labels
        const mergedData = labels.map(labelObj => {
            const match = results.find(result => result.label === labelObj.label);
            return match ? match : labelObj;
        });

        res.status(200).json(mergedData);
    } catch (error) {
        console.error('Error fetching visit data:', error);
        res.status(500).send('Error fetching visit data');
    }
};
