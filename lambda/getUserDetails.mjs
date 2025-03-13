export const handler = async (event) => {
    try {
      
      const response = {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          data:{
            name:"roy",
            age:35
          }
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