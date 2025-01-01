const poolpg = require('../../config/dbpg');

exports.logVisit = async (req, res) => {
    const { pageVisited, sessionId } = req.body;

    try {
        await poolpg.query(
            'INSERT INTO visits (session_id, page_visited, user_agent, ip_address) VALUES ($1, $2, $3, $4)',
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

        query = `SELECT EXTRACT(HOUR FROM visit_time + INTERVAL '2 hours') AS label, COUNT(*) AS visits
                 FROM visits
                 WHERE visit_time >= CURRENT_DATE
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

        query = `SELECT TO_CHAR(visit_time, 'Day') AS label, COUNT(*) AS visits
                 FROM visits
                 WHERE visit_time >= DATE_TRUNC('week', CURRENT_DATE) 
                 AND visit_time < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
                 GROUP BY label`;
    } else if (filter === 'Month') {
        // Generate all days of the month (1 to 31)
        labels = Array.from({ length: 31 }, (_, i) => ({ label: i + 1, visits: 0 }));

        query = `SELECT EXTRACT(DAY FROM visit_time) AS label, COUNT(*) AS visits
                 FROM visits
                 WHERE EXTRACT(YEAR FROM visit_time) = EXTRACT(YEAR FROM CURRENT_DATE)
                   AND EXTRACT(MONTH FROM visit_time) = EXTRACT(MONTH FROM CURRENT_DATE)
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

        query = `SELECT TO_CHAR(visit_time, 'Month') AS label, COUNT(*) AS visits
                 FROM visits
                 WHERE EXTRACT(YEAR FROM visit_time) = EXTRACT(YEAR FROM CURRENT_DATE)
                 GROUP BY label`;
    }

    try {
        const { rows: results } = await poolpg.query(query);
        // console.log('Visits Results:', results);

        console.log('Labels:', labels);

        // Merge results with labels
        const mergedData = labels.map(labelObj => {
            const match = results.find(result => {
                // Compare based on the filter
                if (typeof labelObj.label === 'number') {
                    return Number(result.label.trim()) === labelObj.label; // For 'Day' filter, compare numbers
                } else {
                    return result.label.trim().toLowerCase() === labelObj.label.toLowerCase(); // For others, compare strings
                }
            });
        
            return match ? { label: labelObj.label, visits: Number(match.visits) } : labelObj;
        });
        // console.log('mergedData Results:', mergedData);

        res.status(200).json(mergedData);
    } catch (error) {
        console.error('Error fetching visit data:', error);
        res.status(500).send('Error fetching visit data');
    }
};
