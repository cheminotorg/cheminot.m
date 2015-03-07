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
          d.reject('Unable to get stops_ttree.json');
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

function suggestions(found: Attributes, node: any): any[] {
  if(node) {
    var onLeft = suggestions(found, node.left);
    var onRight = suggestions(found, node.right);
    var onEq = suggestions(found, node.eq);
    var results = new Array<any>();
    var filtered = node.data.filter((station:any) => !found[station.id]);
    if(node.isEnd && filtered.length) {
      filtered.forEach((station:any) => found[station.id] = station);
      results = results.concat(filtered);
    }
    return results.concat(onLeft).concat(onRight).concat(onEq);
  } else {
    return [];
  };
}

export function search(term: string): Station[] {
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
            var filtered = node.data.filter((station:any) => !found[station.id]);
            if(node.isEnd && filtered.length) {
              filtered.forEach((station:any) => found[station.id] = station);
              results = results.concat(node.data);
            }
            return results.concat(suggestions(found, node.eq));
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

  var results = (term.length > 0) ? step(term.toLowerCase(), TREE, []) : [];
  results = _.take(results, 100);
  results.sort((a: Station, b: Station) => {
    var x =  a.name.toLowerCase().indexOf(term) - b.name.toLowerCase().indexOf(term);
    return (x == 0) ? a.name.length - b.name.length : x;
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

export function init(): Q.Promise<any> {
  return getStationsTree();
}
