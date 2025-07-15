function ErrorFallback({ error }) {
    return (<div>
      <h1>Irgendwas ist schief gelaufen :/</h1>
      <p>{error.name}</p>
      <p>{error.message}</p>
      <p>Bitte versuchen Sie es später erneut.</p>
    </div>);
}
export default ErrorFallback;
//# sourceMappingURL=ErrorFallback.js.map