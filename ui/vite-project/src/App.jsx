import "./App.css";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import axios from "axios"; // Import Axios
import SignUp from "./SignUp";

// Amplify configuration
Amplify.configure({
  aws_project_region: import.meta.env.VITE_AWS_COGNITO_REGION,
  aws_cognito_identity_pool_id: import.meta.env
    .VITE_AWS_COGNITO_IDENTITY_POOL_ID,
  aws_cognito_region: import.meta.env.VITE_AWS_COGNITO_REGION,
  aws_user_pools_id: import.meta.env.VITE_AWS_USER_POOLS_ID,
  aws_user_pools_web_client_id: import.meta.env
    .VITE_AWS_USER_POOLS_WEB_CLIENT_ID,
});

function ApiCallComponent() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Add loading state

  // Function to handle API call
  const handleApiCall = async () => {
    setLoading(true); // Set loading to true when the request starts
    setError(null); // Clear previous errors
    setData(null); // Clear previous data

    try {
      const { tokens } = await fetchAuthSession();
      const jwtToken = tokens.idToken.toString();

      // Make API call using Axios
      const response = await axios.post(
        import.meta.env.VITE_API_GATEWAY_URL,
        {}, // Empty body (add data here if needed)
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      setData(response.data); // Set the response data
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false); // Stop loading after the request completes
    }
  };

  return (
    <div>
      <button onClick={handleApiCall} disabled={loading}>
        {loading ? "Loading..." : "Call API"}
      </button>
      {error && <div>Error: {error}</div>}
      {data && <div>Data: {JSON.stringify(data)}</div>}
    </div>
  );
}

function App() {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);

  return (
    <>
      {authStatus === "authenticated" ? (
        
        <div>
        <h1>Welcome to the App</h1>
        <ApiCallComponent />
      </div>
      ) : (
        <SignUp />
      )}
    </>
  );
}

export default App;
