module.exports = {
    defaultList : [
        {'intitule': 'connexion','description': 'Opération liées à la gestion de session','transaction': false}, 
        {'intitule': 'onbording','description': 'Opération liées à la création de compte utilisateur','transaction': false}, 
        {'intitule': 'ressources','description': 'Opération liées au chargement de ressources fonctionnelles','transaction': false}, 
        {'intitule': 'configuration','description': 'Opération liées à la configuration de ressources systèmes','transaction': false}, 
        {'intitule': 'administration','description': 'Opération liées à l\'administration','transaction': false}, 
        {'intitule': 'souscription','description': 'Opération pour toute action de souscription','transaction': true}, 
        {'intitule': 'rachat','description': 'Opération pour toute action de rachat','transaction': true}, 
        {'intitule': 'transfert','description': 'Opération pour toute action de transafert','transaction': true}
    ]
}