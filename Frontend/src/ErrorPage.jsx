import React, { useState, useEffect } from 'react';
import './App.css'; 

const ErrorPage = () => {
  const [refId, setRefId] = useState('');

  useEffect(() => { 
    const randomId = Math.floor(Math.random() * 90000 + 10000);
    setRefId(`404-${randomId}`);
  }, []);

  return (
    <div className="not-found-wrapper"> 
      <div className="error-num-large">404</div> 
      <h1 className="error-title-sub">Module Unavailable</h1> 
      <p className="error-msg">
        The requested module is not available in the current system context.
        It may have been removed, relocated, or access permissions may have changed.
        Please contact your system administrator if this persists.
      </p>
 
      <div className="button-group">
        <button 
          className="btn-base btn-primary" 
          onClick={() => window.location.href = '/dashboard'}
        >
          Return to Dashboard
        </button>
        <button 
          className="btn-base btn-outline" 
          onClick={() => window.history.back()}
        >
          Go Back
        </button>
      </div>
 
      <div className="footer-meta">
        <div>ERP_CORE_LOG</div>
        <div>
          Error Ref: <span style={{ fontWeight: 600 }}>{refId}</span>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;