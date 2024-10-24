const CONFIG = {
  development: {
    // apiUrl: "http://127.0.0.1:5000",
    apiUrl: "http://bookwormio.us-west-1.elasticbeanstalk.com",
  },
  production: {
    // TODO: add production API URL when hosted
    apiUrl: () => {
      throw new Error("Unimplemented");
    },
  },
};

const ENV = process.env.NODE_ENV ?? "development";
export const { apiUrl } = CONFIG[ENV];
