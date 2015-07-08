cheminot.m
==========

L'application mobile pour consulter vos horaires de train n'importe où et n'importe quand.

## A propos

`cheminot.m` est une application mobile hybride [cordova](https://cordova.apache.org).
Elle est donc construite à partir de technologies web comme [typescript](http://www.typescriptlang.org) et [mithril](https://github.com/lhorie/mithril.js).
Pour le moment, il n'est possible de lancer cette application uniquement sur un périphérique android ou bien dans un navigateur.
L'investissement pour porter cette application pour iOS n'est pas un travail considérable.

## Installation

Le script d'installation `setup/setup.sh` à certains pré-requis avant de pouvoir être executé:

* [npm](https://www.npmjs.org)
* [typescript](http://www.typescriptlang.org)
* [android SDK](http://developer.android.com/sdk/index.html)
* [android NDK](https://developer.android.com/tools/sdk/ndk/index.html)
* [tarifa](http://tarifa.tools)

Pour installer `typescript`, il est nécessaire de le cloner et de le construire sur votre propre machine.

Ce script va s'executer de la manière suivante:

* Installer [gulp](http://gulpjs.com/) et ses dependances.
* Installer les dépendances du project web.
* Lier le plugin [gulp-tsc](https://www.npmjs.com/package/gulp-tsc) à votre clone local de `typescript`.
* Installer les vendors dans le répertoire `project/www/js/vendors/`.
* Installer la plateforme cordova `android` et `browser` ainsi que les plugins.
* Compiler le code natif inclut par le plugin [m.cheminot.plugin]("https://github.com/cheminotorg/m.cheminot.plugin") avec ndk.
* Construire un apk de développment pour android.
* Constuire et lancer dans le navigateur l'application.

Lancez le script en précisant le chemin vers le répertoire local de votre clone `typescript`:

`sh setup/setup.sh <path_to_typeScript_dir>`

## Construire différentes versions

L'ensemble du cycle de construction de cette application est géré par [tarifa]("http://tarifa.tools").
Il nous permet entre autre de construire facilement différentes versions de notre application.

Voici les différents choix qui s'offre à vous:

* `tarifa build browser`: construit une version pour le navigateur. Les données sont mockées.
* `tarifa build browser demo`: construit une version pour le navigateur et plus spécifiquement pour la démo de [cheminot.org](http://cheminot.org).
* `tarifa build browser demo --mode=prod`: Idem que le précédent mais minifie et gzip les assets.
* `tarifa build android`: construit une version pour android. Les données sont mockées.
* `tarifa build android stage`: construit une version pour android de stage. Les données ne sont pas mockées.
* `tarifa build android prod`: construit une version pour android de production. Les données ne sont pas mockées.
