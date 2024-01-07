const AWS = require('aws-sdk');

module.exports.processQueue = async (event) => {
  const sqs = new AWS.SQS();

  // Receive messages from FirstQueue
  const receiveParams = {
    QueueUrl: 'https://sqs.us-east-1.amazonaws.com/854238308734/FirstQueue', // Replace with the URL of your FirstQueue
    MaxNumberOfMessages: 10, // Adjust as needed
    WaitTimeSeconds: 1,
  };

  const receiveResult = await sqs.receiveMessage(receiveParams).promise();

  if (receiveResult.Messages) {
    // Messages received from FirstQueue
    const messages = receiveResult.Messages.map(message => {
      return {
        Id: message.MessageId,
        MessageBody: message.Body,
      };
    });

    // Send messages to SecondQueue
    const sendParams = {
      Entries: messages,
      QueueUrl: 'https://sqs.us-east-1.amazonaws.com/854238308734/SecondQueue', // Replace with the URL of your SecondQueue
    };

    await sqs.sendMessageBatch(sendParams).promise();

    // Delete received messages from FirstQueue
    const deleteParams = {
      Entries: receiveResult.Messages.map(message => {
        return {
          Id: message.MessageId,
          ReceiptHandle: message.ReceiptHandle,
        };
      }),
      QueueUrl: 'https://sqs.us-east-1.amazonaws.com/854238308734/FirstQueue', // Replace with the URL of your FirstQueue
    };

    await sqs.deleteMessageBatch(deleteParams).promise();
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Messages processed and sent to SecondQueue.',
    }),
  };
};
