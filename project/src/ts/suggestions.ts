import m = require('mithril');
import Q = require('q');
import _ = require('lodash');

let TREE: any[] = null;

function getStationsTree(): Q.Promise<any> {
  const d = Q.defer<any>();
  const req = new XMLHttpRequest();
  if(!TREE) {
    req.onreadystatechange = () => {
      if (req.readyState === 4) {
        if(req.status === 200 || req.status === 0) {
          const stations = JSON.parse(req.responseText);
          TREE = stations;
          d.resolve(stations);
        } else {
          throw new Error('Unable to get stops_ttree.json');
        }
      }
    };
    req.open('GET', 'data/stops_ttree.json', true);
    req.send(null);
  } else {
    d.resolve(TREE);
  }
  return d.promise;
}

function suggestions(predicat: (station: SuggestedStation) => boolean, found: Attributes, node: any): any[] {
  if(node) {
    const onLeft = suggestions(predicat, found, node.left);
    const onRight = suggestions(predicat, found, node.right);
    const onEq = suggestions(predicat, found, node.eq);
    let results = new Array<any>();
    const filtered = node.data.filter((station:any) => !found[station.id] && predicat(station));
    if(node.isEnd && filtered.length) {
      filtered.forEach((station:any) => found[station.id] = station);
      results = results.concat(filtered);
    }
    return results.concat(onLeft).concat(onRight).concat(onEq);
  } else {
    return [];
  };
}

export function search(term: string, predicat: (station: SuggestedStation) => boolean = () => true): SuggestedStation[] {
  const found: Attributes = {};
  function step(term: string, node: any, results: any[]): any[] {
    if(node) {
      const word = term.split('');
      if(word.length) {
        const h = word.shift();
        if(h < node.c) {
          return step(term, node.left, results);
        } else if(h > node.c) {
          return step(term, node.right, results);
        } else {
          if(word.length == 0) {
            const filtered = node.data.filter((station:any) => !found[station.id] && predicat(station));
            if(node.isEnd && filtered.length) {
              filtered.forEach((station:any) => found[station.id] = station);
              results = results.concat(node.data);
            }
            return results.concat(suggestions(predicat, found, node.eq));
          } else {
            return step(word.join(''), node.eq, results);
          }
        }
      } else {
        return results;
      }
    } else {
      return results;
    }
  }

  term = term.toLowerCase();
  let results = (term.length > 0) ? step(term, TREE, []) : [];
  results = _.take(results, 50);
  results.sort((a: SuggestedStation, b: SuggestedStation) => {
    const x =  a.name.toLowerCase().indexOf(term) - b.name.toLowerCase().indexOf(term);
    return (x == 0) ? ((a.name < b.name) ? -1 : 1) : x;
  });
  return results;
}

export function getStationByTerm(term: string): SuggestedStation {
  const results = search(term);
  if(results.length > 0) {
    return _.head(results);
  } else {
    return null;
  }
}

export function adaptSaintWord(term: string, station: SuggestedStation): string {
  const stationSaintMatches = station.name.match(/^Saint[-|\s](.*)$/);
  const stationStMatches = station.name.match(/^St[-|\s](.*)$/);
  const stationMatches = stationStMatches || stationSaintMatches;
  if(stationMatches) {
    const termStMatches = term.match(/^st(\s|-)?.*$/);
    if(termStMatches) return "St" + (termStMatches[1] || '-') + stationMatches[1];
    const termSaintMatches = term.match(/^saint(\s|-)?.*$/);
    if(termSaintMatches) return "Saint" + (termSaintMatches[1] || '-') + stationMatches[1];
    return station.name;
  } else {
    return null;
  }
}

export function adaptCompoundWord(term: string, station: SuggestedStation): string {
  const termSpaceIndex = term.indexOf(' ');
  const termDashIndex = term.indexOf('-');
  const termSep = (() => {
    if(termSpaceIndex > -1 && termDashIndex > -1) {
      const a = (termSpaceIndex < 0 ? term.length : termSpaceIndex);
      const b = (termDashIndex < 0 ? term.length : termDashIndex);
      return a < b ? " " : "-";
    } else if(termSpaceIndex > -1) {
      return " ";
    } else if(termDashIndex > -1) {
      return "-";
    }
  })();
  if(termSep!=null) {
    const stationSpaceIndex = station.name.indexOf(' ');
    const stationDashIndex = station.name.indexOf('-');
    const [stationSep, stationNewsep] = (() => {
      const a = (stationSpaceIndex < 0 ? station.name.length : stationSpaceIndex);
      const b = (stationDashIndex < 0 ? station.name.length : stationDashIndex);
      return a < b ? [" ", "-"] : ["-", " "];
    })();
    if(stationSep != termSep) {
      if(stationSpaceIndex > -1 && stationDashIndex >-1) {
        const split = station.name.split(stationNewsep);
        const h = split[0].replace(new RegExp(stationSep, 'g'), stationNewsep);
        const t = split.splice(1);
        return h + stationNewsep + t.join(stationNewsep);
      } else {
        return station.name.replace(new RegExp(stationSep, 'g'), stationNewsep);
      }
    }
  }
  return station.name;
}

export function init(): Q.Promise<any> {
  return getStationsTree();
}
