import { useEffect, useState } from "react";
import axiosUtils from "./utils/axiosUtils";

const Sitemap = () => {
    const [sitemap, setSitemap] = useState('');
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchSitemap = async () => {
            try {
                const response = await axiosUtils('/sitemap.xml', 'GET', {}, {}, {}, null);
                setSitemap(response.data);
            } catch (err) {
                console.error('Error fetching sitemap:', err);
                setError(true);
            }
        };

        fetchSitemap();
    }, []);

    if (error) {
        return <div>Error fetching the sitemap. Please try again later.</div>;
    }

    if (!sitemap) {
        return <div>Loading sitemap...</div>;
    }

    return (
        <pre
            style={{
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                backgroundColor: '#f9f9f9',
                padding: '1rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
            }}
        >
            {sitemap}
        </pre>
    );
};

export default Sitemap;