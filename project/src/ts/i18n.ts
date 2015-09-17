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
    'pull-to-refresh': 'Tirer pour les départs suivant',
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
    'stars-empty': 'Aucun trajet en favoris',
    'add-star': 'Ajouter un trajet',
    'unstar-trip-back': 'Voulez-vous également retirer le trajet retour des favoris ?',
    'star-trip-back': 'Voulez-vous également mettre le trajet retour en favoris ?',
    'less-one-minute': 'Imminent'
  }
};

export function get(key: string): string {
  return fr(key);
}

function fr(key: string): string {
  return messages['fr'][key] || '???';
}
