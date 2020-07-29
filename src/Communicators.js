import axios from 'axios';

class Communicators {
  static APIurl = 'http://178.128.206.150:7000';

  static Fetch = searchedTerm => {
    return fetch(`${Communicators.omdbURL}&s=${searchedTerm}`).then(response =>
      response.json()
    );
  };

  static getAPIkey = async () => {
    try {
      let APIkey = await axios.post(`${this.APIurl}/register_candidate`);
      // console.log(APIkey.data.apikey);
      return APIkey.data.apikey;
    } catch (error) {
      console.log(error);
    }
  };

  static createPlayer = async (name, apikey) => {
    try {
      let data = {
        name: name,
        apikey: apikey,
      };
      let player = await axios.post(`${this.APIurl}/player`, data);
      console.log(player);
      return player.data;
    } catch (error) {
      console.log(error);
    }
  };
}

export { Communicators };
