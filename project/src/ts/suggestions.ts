import m = require('mithril');
import Q = require('q');
import _ = require('lodash');

var TREE: any[] = null;

function getStationsTree(): Q.Promise<any> {
  var d = Q.defer<any>();
  var req = new XMLHttpRequest();
  if(!TREE) {
    req.onreadystatechange = () => {
      if (req.readyState === 4) {
        if(req.status === 200 || req.status === 0) {
          var stations = JSON.parse(req.responseText);
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

function suggestions(predicat: (station: Station) => boolean, found: Attributes, node: any): any[] {
  if(node) {
    var onLeft = suggestions(predicat, found, node.left);
    var onRight = suggestions(predicat, found, node.right);
    var onEq = suggestions(predicat, found, node.eq);
    var results = new Array<any>();
    var filtered = node.data.filter((station:any) => !found[station.id] && predicat(station));
    if(node.isEnd && filtered.length) {
      filtered.forEach((station:any) => found[station.id] = station);
      results = results.concat(filtered);
    }
    return results.concat(onLeft).concat(onRight).concat(onEq);
  } else {
    return [];
  };
}

export function search(term: string, predicat: (station: Station) => boolean = () => true): Station[] {
  var found: Attributes = {};
  function step(term: string, node: any, results: any[]): any[] {
    if(node) {
      var word = term.split('');
      if(word.length) {
        var h = word.shift();
        if(h < node.c) {
          return step(term, node.left, results);
        } else if(h > node.c) {
          return step(term, node.right, results);
        } else {
          if(word.length == 0) {
            var filtered = node.data.filter((station:any) => !found[station.id] && predicat(station));
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
  var results = (term.length > 0) ? step(term, TREE, []) : [];
  results = _.take(results, 100);
  results.sort((a: Station, b: Station) => {
    var x =  a.name.toLowerCase().indexOf(term) - b.name.toLowerCase().indexOf(term);
    return (x == 0) ? ((a.name < b.name) ? -1 : 1) : x;
  });
  return results;
}

export function getStationByTerm(term: string): Station {
  var results = search(term);
  if(results.length > 0) {
    return _.head(results);
  } else {
    return null;
  }
}

export function adaptSaintWord(term: string, station: Station): string {
  var stationSaintMatches = station.name.match(/^Saint[-|\s](.*)$/);
  var stationStMatches = station.name.match(/^St[-|\s](.*)$/);
  var stationMatches = stationStMatches || stationSaintMatches;
  if(stationMatches) {
    var termStMatches = term.match(/^st(\s|-)?.*$/);
    if(termStMatches) return "St" + (termStMatches[1] || '-') + stationMatches[1];
    var termSaintMatches = term.match(/^saint(\s|-)?.*$/);
    if(termSaintMatches) return "Saint" + (termSaintMatches[1] || '-') + stationMatches[1];
    return station.name;
  } else {
    return null;
  }
}

export function adaptCompoundWord(term: string, station: Station): string {
  var termSpaceIndex = term.indexOf(' ');
  var termDashIndex = term.indexOf('-');
  var termSep = (() => {
    if(termSpaceIndex > -1 && termDashIndex > -1) {
      var a = (termSpaceIndex < 0 ? term.length : termSpaceIndex);
      var b = (termDashIndex < 0 ? term.length : termDashIndex);
      return a < b ? " " : "-";
    } else if(termSpaceIndex > -1) {
      return " ";
    } else if(termDashIndex > -1) {
      return "-";
    }
  })();
  if(termSep!=null) {
    var stationSpaceIndex = station.name.indexOf(' ');
    var stationDashIndex = station.name.indexOf('-');
    var [stationSep, stationNewsep] = (() => {
      var a = (stationSpaceIndex < 0 ? station.name.length : stationSpaceIndex);
      var b = (stationDashIndex < 0 ? station.name.length : stationDashIndex);
      return a < b ? [" ", "-"] : ["-", " "];
    })();
    if(stationSep != termSep) {
      if(stationSpaceIndex > -1 && stationDashIndex >-1) {
        var split = station.name.split(stationNewsep);
        var h = split[0].replace(new RegExp(stationSep, 'g'), stationNewsep);
        var t = split.splice(1);
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
