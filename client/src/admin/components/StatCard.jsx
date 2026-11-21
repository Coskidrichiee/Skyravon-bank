import "../css/statcard.css";

function StatCard({
    title,
    value,
    icon,
    color = "#2563eb",
    subtitle = "",
    loading = false,
    currency = false
}) {
    const formatValue = (input) => {
        if (loading) return "Loading...";

        if (input === null || input === undefined || input === "") {
            return currency ? "$0.00" : "0";
        }

        const numericValue = Number(input);

        if (!Number.isFinite(numericValue)) {
            return input;
        }

        if (currency) {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: typeof currency === "string" ? currency : "USD",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(numericValue);
        }

        return numericValue.toLocaleString("en-US");
    };

    return (
        <div
            className={`stat-card ${loading ? "stat-card-loading" : ""}`}
            style={{ "--card-color": color }}
        >
            <div className="stat-card-header">
                <div className="stat-heading">
                    <span className="stat-title">{title}</span>
                    <span className="stat-indicator">
                        <span className="indicator-dot"></span>
                        {loading ? "Updating" : "Live"}
                    </span>
                </div>

                <div className="stat-icon">
                    {icon}
                </div>
            </div>

            <div className="stat-card-content">
                <h3 className="stat-value">
                    {formatValue(value)}
                </h3>

                {subtitle && (
                    <p className="stat-subtitle">
                        {subtitle}
                    </p>
                )}
            </div>

            <div className="stat-card-divider"></div>

            <div className="stat-card-footer">
                <div className="stat-footer-icon">
                    <span className="footer-dot"></span>
                    <span>
                        {loading
                            ? "Retrieving database information"
                            : "Database statistics"}
                    </span>
                </div>

                <span className="stat-footer-label">
                    {loading ? "Please wait" : "Updated"}
                </span>
            </div>
        </div>
    );
}

export default StatCard;