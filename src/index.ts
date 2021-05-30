import axios from "axios";

const lang = "";
const apiKey = "";
const requestTokenV4 = "";
const idListToAdd = "";

interface TMDBSearchResult {
  page: number;
  results: { id: number }[];
  total_pages: number;
  total_results: number;
}

const movies = [
  {
    name: "Deadpool",
    year: "2016",
  },
];

async function main() {
  try {
    const asyncMapID = await Promise.all(
      movies.map(async (movie) => {
        const formattedName = movie.name
          .trim()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

        try {
          const result = await axios.get<TMDBSearchResult>(
            `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=${lang}&query=${formattedName}&year=${movie.year}&page=1&include_adult=false`
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return result.data.results[0].id;
        } catch (error) {
          console.log("failed film: " + movie.name);
          return undefined;
        }
      })
    );

    console.log(asyncMapID);

    const requestToken = await axios.post<{ request_token: string }>(
      `https://api.themoviedb.org/4/auth/request_token`,
      {},
      {
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          authorization: `Bearer ${requestTokenV4}`,
        },
      }
    );

    const createdToken = requestToken.data.request_token;

    const accessToken = await axios.post<{ access_token: string }>(
      `https://api.themoviedb.org/4/auth/access_token?api_key=${apiKey}`,
      {
        request_token: createdToken,
      },
      {
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          authorization: `Bearer ${requestTokenV4}`,
        },
      }
    );

    const added = await axios.post(
      `https://api.themoviedb.org/4/list/${idListToAdd}/items`,
      {
        items: asyncMapID.map((id) => ({
          media_type: "movie",
          media_id: id,
        })),
      },
      {
        headers: {
          "Content-Type": "application/json;charset=utf-8",
          authorization: `Bearer ${accessToken.data.access_token}`,
        },
      }
    );
    console.log(added.data);
  } catch (error) {
    console.log(error);
  }
}

main();
