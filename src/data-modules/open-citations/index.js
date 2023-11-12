import { useContext, useState } from 'react';
import { Store } from 'core/state/data';
import { addDataModule } from 'core/module-loader';
import doiRegex from 'doi-regex';

export const OpenCitations = () => {
  const { Papers, updatePapers } = useContext(Store);
  const [requests, setState] = useState([]);
  let toQuery = Object.values(Papers).filter(
    p => p.seed && doiRegex({ exact: true }).test(p.doi) && !requests[p.doi]
  );
  if (toQuery.length) {
    const newRequests = toQuery.reduce((curr, next) => ({ ...curr, [next.doi]: 'pending' }), {});
    setState({ ...requests, ...newRequests });
    toQuery.forEach(paper => {
      getCitations(paper).then(updatedPaper => updatePapers([updatedPaper]));
    });
  }
  return null;
};

export function getCitations(paper) {
  let url = `https://opencitations.net/index/api/v1/citations/${paper.doi}`;
  //let url = `https://w3id.org/oc/index/api/v1/citations/${paper.doi}`;
  return fetch(url, {
    headers: {
      Accept: 'application/sparql-results+json'
    }
  })
    .then(resp => {
      if (resp.status !== 200) console.log(resp.status, resp.text());
      return resp;
    })
    .then(resp => resp.json())
    .then(data => {
      return parseResponse(data, paper);
    });
}

export function parseResponse(response, paper) {
  const updatedPaper = {
    ...paper,
    citations: response.map(edge => {
      return {
        //doi: edge.citing.match(/=> (\S*)/)[1]
        doi: edge.citing
      };
    })
  };
  return updatedPaper;
}

export default OpenCitations;

addDataModule(OpenCitations);
