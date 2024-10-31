const CONFIG = {
  development: {
    // recomendationAPIUrl: "http://127.0.0.1:5000",
    recomendationAPIUrl: "http://bookwormio.us-west-1.elasticbeanstalk.com",
  },
  production: {
    // TODO: add production API URL when hosted
    recomendationAPIUrl: () => {
      throw new Error("Unimplemented");
    },
  },
};

const ENV = process.env.NODE_ENV ?? "development";
export const { recomendationAPIUrl } = CONFIG[ENV];
