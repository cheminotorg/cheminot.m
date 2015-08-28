type Messages = {
  [index: string]: any;
}

const messages: Messages = {
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
    'pull-to-refresh': 'Tirer pour les horaires suivant',
    'trip-not-direct': 'Votre trajet n\'est pas direct! Veuillez patienter...',
    'release-to-refresh': 'Relacher pour actualiser',
    'loading': 'Chargement...',
    'changement': 'changement',
    'cancel': 'annuler',
    'clear': 'effacer',
    'no-trip-matched': 'Impossible de trouver des trajets correspondant à votre recherche',
    'demo-try-later-busy': "Le serveur semble surchargé. Reessayer plus tard.",
    'unexpected-error': 'Une erreur inattendue est survenue. Un rapport d\'erreur vient d\'être envoyé.',
    'your-departures': 'Vos prochains départs',
    'stars-empty': 'Il semblerait que vous n\'allez encore aucun trajets en favoris!',
    'add-stars': 'Ajouter un trajet maintenant'
  }
};

export function get(key: string): string {
  return fr(key);
}

function fr(key: string): string {
  return messages['fr'][key] || '???';
}
