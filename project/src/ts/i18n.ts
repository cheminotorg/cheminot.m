type Messages = {
  [index: string]: any;
}

var messages: Messages = {
  'fr': {
    'today': "Aujourd'hui",
    'tomorrow': 'Demain',
    'other': 'Autre',
    'departure': 'Départ',
    'arrival': 'Arrivée',
    'no-result': 'Aucun résultat',
    'departure-date': 'Date de départ',
    'departure-time': 'Heure de départ',
    'search': 'Rechercher',
    'direct': 'Direct',
    'pull-to-refresh': 'Tirer pour actualiser',
    'trip-not-direct': 'Votre trajet n\'est pas direct! Veuillez patienter...',
    'release-to-refresh': 'Relacher pour actualiser',
    'loading': 'Chargement...',
    'changement': 'changement',
    'cancel': 'annuler',
    'clear': 'effacer',
    'no-trip-matched': 'Impossible de trouver des trajets correspondant à votre recherche'
  }
};

export function fr(key: string): string {
  return messages['fr'][key];
}
