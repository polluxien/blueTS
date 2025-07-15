import React from "react";
import ErrorFallback from "./ErrorFallback";
export default class ErrorBoundary extends React.Component {
    state = {
        hasError: false,
        error: null,
    };
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error("Error caught by ErrorBoundary:", error, errorInfo);
    }
    render() {
        const { hasError, error } = this.state;
        if (hasError) {
            return <ErrorFallback error={error}/>;
        }
        return this.props.children;
    }
}
//# sourceMappingURL=ErrorBoundary.js.map