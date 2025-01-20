import dotenv from 'dotenv';
dotenv.config();

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: 'us-east-1',
  endpoint: 'http://host.docker.internal:8000',
});

const ddbDocClient = DynamoDBDocumentClient.from(client);


export const putItemHandler = async (event) => {
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*', // Allow all origins
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: `Method not allowed. Use POST instead of ${event.httpMethod}` }),
    };
  }

  console.info('Received request:', event);

  const body = JSON.parse(event.body);
  const { id, name } = body;

  const params = {
    TableName: process.env.SAMPLE_TABLE,
    Item: { id, name },
  };

  try {
    const data = await ddbDocClient.send(new PutCommand(params));
    console.log('Success - item added or updated', data);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, item: body }),
    };
  } catch (err) {
    console.error('Error adding item:', err);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Failed to add item', details: err.message }),
    };
  }
};
