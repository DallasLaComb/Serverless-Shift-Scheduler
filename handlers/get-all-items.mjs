import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import dotenv from 'dotenv';
dotenv.config();

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: 'us-east-1', // Specify the correct region
  endpoint: 'http://host.docker.internal:8000', // Use this for local development
});

// Create DocumentClient for DynamoDB
const ddbDocClient = DynamoDBDocumentClient.from(client);

export const getAllItemsHandler = async (event) => {
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  console.log('Environment Variable SAMPLE_TABLE:', process.env.SAMPLE_TABLE);

  if (!process.env.SAMPLE_TABLE) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Environment variable SAMPLE_TABLE is not set' }),
    };
  }

  const params = { TableName: process.env.SAMPLE_TABLE };

  try {
    const data = await ddbDocClient.send(new ScanCommand(params));
    console.log('DynamoDB Query Result:', data);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(data.Items || []),
    };
  } catch (error) {
    console.error('Error querying DynamoDB:', error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Failed to retrieve items', details: error.message }),
    };
  }
};
