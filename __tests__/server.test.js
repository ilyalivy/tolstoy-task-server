const request = require('supertest');
const axios = require('axios');
const app = require('../server');

jest.mock('axios');

describe('POST /fetch-metadata', () => {
  test('returns metadata for valid URLs', async () => {
    const mockResponse = { 
      data: '<html><head><title>Example Domain</title><meta name="description" content="Example Description"><meta property="og:image" content="example.jpg"></head></html>',
      status: 200
    };
    axios.get.mockResolvedValueOnce(mockResponse);

    const res = await request(app)
      .post('/fetch-metadata')
      .send({ urls: ['https://example.com', 'https://example2.com', 'https://example3.com'] });

    expect(res.statusCode).toBe(200);
    expect(res.body[0]).toHaveProperty('title', 'Example Domain');
    expect(res.body[0]).toHaveProperty('description', 'Example Description');
    expect(res.body[0]).toHaveProperty('image', 'example.jpg');
  });

  test('returns an error if less than 3 URLs are provided', async () => {
    const res = await request(app)
      .post('/fetch-metadata')
      .send({ urls: ['https://example.com'] });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Please provide at least 3 URLs.');
  });

  test('returns an error if the URL is invalid', async () => {
    const error = new Error('ENOTFOUND');
    error.code = 'ENOTFOUND';
    axios.get.mockRejectedValueOnce(error);

    const res = await request(app)
      .post('/fetch-metadata')
      .send({ urls: ['https://invalid-url.com', 'https://example2.com', 'https://example3.com'] });

    expect(res.statusCode).toBe(200);
    expect(res.body[0]).toHaveProperty('error', 'Invalid URL or the server is not reachable.');
  });

  test('handles network errors gracefully', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network Error'));

    const res = await request(app)
      .post('/fetch-metadata')
      .send({ urls: ['https://example.com', 'https://example2.com', 'https://example3.com'] });

    expect(res.statusCode).toBe(200);
    expect(res.body[0]).toHaveProperty('error', 'Network error occurred while trying to fetch the URL.');
  });

  test('handles multiple URLs correctly', async () => {
    const mockResponse = { 
      data: '<html><head><title>Example Domain</title><meta name="description" content="Example Description"></head></html>',
      status: 200
    };
    axios.get.mockResolvedValue(mockResponse);

    const res = await request(app)
      .post('/fetch-metadata')
      .send({ urls: ['https://example.com', 'https://example2.com', 'https://example3.com'] });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.body[0]).toHaveProperty('title', 'Example Domain');
  });
});