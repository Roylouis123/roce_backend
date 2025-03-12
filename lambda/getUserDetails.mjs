export const handler = async (event) => {
    try {
      // Get Cognito user info from the event
      const user = event.requestContext.authorizer.claims;
      
      const response = {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          message: 'User details retrieved successfully',
        })
      };
      
      return response;
    } catch (error) {
      console.error('Error:', error);
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          message: 'Error retrieving user details',
          error: error.message
        })
      };
    }
  };