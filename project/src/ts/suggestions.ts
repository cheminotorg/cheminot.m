import m = require('mithril');
import Q = require('q');

var STATIONS: any[] = null;

export interface Station {
  name: string;
  id: string;
}

function getStationsTree(): Q.Promise<any> {
  var d = Q.defer<any>();
  var req = new XMLHttpRequest();
  if(!STATIONS) {
    req.onreadystatechange = () => {
      if (req.readyState === 4) {
        if(req.status === 200) {
          var stations = JSON.parse(req.responseText);
          STATIONS = stations;
          d.resolve(stations);
        } else {
          d.reject('Unable to get stops_ttree.json');
        }
      }
    };
    req.open('GET', 'data/stops_ttree.json', true);
    req.send(null);
  } else {
    d.resolve(STATIONS);
  }
  return d.promise;
}

function suggestions(node: any): any[] {
  if(node) {
    var onLeft = suggestions(node.left);
    var onRight = suggestions(node.right);
    var onEq = suggestions(node.eq);
    var results = new Array<any>();
    if(node.isEnd) {
      results.push(node.data);
    }
    return results.concat(onLeft).concat(onRight).concat(onEq);
  } else {
    return [];
  };
}

export function search(term: string): Station[] {
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
            if(node.isEnd) {
              results.push(node.data);
            }
            return results.concat(suggestions(node.eq));
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

  return (term.length > 0) ? step(term.toLowerCase(), STATIONS, []) : [];
}

export function init(): Q.Promise<any> {
  return getStationsTree();
}
