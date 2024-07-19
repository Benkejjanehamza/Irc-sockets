# My_IRC

## Introduction

Bienvenue dans le projet My_IRC. Ce projet consiste à développer un serveur Internet Relay Chat (IRC) utilisant NodeJS. Notre serveur IRC accepte plusieurs connexions simultanées et implémente la notion de "channels" permettant aux utilisateurs de rejoindre plusieurs canaux simultanément via un système d'onglets.

## Technologies Utilisées

Pour ce projet, j'ai utilisé les technologies suivantes :
- Node.js pour le serveur
- Socket.io pour la gestion des web sockets et des rooms
- Express.js pour la création de l'API du serveur
- Angular pour le front-end

## Fonctionnalités

### Gestion des utilisateurs
- **Système de connexion** : Les utilisateurs peuvent se connecter en fournissant un nom d'utilisateur.
- **Modification des informations** : Les utilisateurs peuvent modifier leurs informations et ajouter des channels.
- **Gestion des channels** : Les utilisateurs peuvent créer, supprimer et modifier leurs propres channels.

### Gestion des channels
- **Notifications globales** : Chaque action (création, suppression de channels et changement de pseudo) envoie un message global visible sur tous les channels.
- **Notifications de connexion** : Un nouvel utilisateur se connectant à un channel envoie un message visible sur ce channel.
- **Auto-suppression des channels** : Un channel est automatiquement supprimé si personne n'y a écrit depuis 5 minutes (configurable pour 2 jours en production).
- **Envoi de messages** : Les utilisateurs peuvent envoyer des messages à tous les utilisateurs d'un channel spécifique.
- **Mise à jour des listes** : Le serveur maintient à jour la liste des utilisateurs connectés et des channels.

### Commandes
Il est possible d'entrer des commandes dans le chat pour réaliser différentes actions :
- `/nick nickname` : Définit le surnom de l'utilisateur.
- `/list [string]` : Liste les channels disponibles. N'affiche que les channels contenant la chaîne “string” si spécifiée.
- `/create channel` : Crée un channel.
- `/delete channel` : Supprime un channel.
- `/join channel` : Rejoint un channel.
- `/leave channel` : Quitte un channel.
- `/users` : Liste les utilisateurs connectés à un channel.
- `/msg nickname message` : Envoie un message à un utilisateur spécifique.
- `message` : Envoie un message à tous les utilisateurs connectés au channel (en tapant sur entrée).

### Interface Utilisateur
J'ai développé une interface utilisateur intuitive et responsive en Angular pour permettre aux utilisateurs d'utiliser le serveur IRC sans avoir à connaître les commandes du mode terminal.

