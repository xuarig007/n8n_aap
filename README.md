
# n8n-nodes-ansible-automation-platform


<img src="workflow_aap.png">

Ce nœud permet d'interagir avec l'API d'**Ansible Automation Platform (AAP) RedHat** directement depuis vos workflows n8n. Il facilite le lancement de modèles de travaux (job templates) et le suivi de leur exécution.

## 🚀 Fonctionnalités

* **Gestion des Modèles (Model) :**
* **Launch** : Lance un Job Template spécifique avec des variables personnalisées (Extravars).
* **Récupération dynamique** : Liste automatiquement les templates disponibles sur votre instance.


* **Gestion des Travaux (Job) :**
* **Get Status** : Récupère l'état d'avancement d'un job et son flux de sortie (`stdout`) complet au format JSON.



[]

---

## ⚙️ Configuration requise

### Authentification

Ce nœud supporte deux types d'authentification (à configurer dans la section *Credentials* de n8n) :

1. **Basic Auth** : Utilise un nom d'utilisateur et un mot de passe.
2. **OAuth2** : Utilise un jeton d'accès (Token) pour une sécurité accrue.

> **Note :** Vous devrez renseigner le **domaine** de votre instance AAP (ex: `https://ansible.mon-entreprise.com`) dans les réglages des identifiants.

---

## 🛠 Utilisation

<>

### 1. Lancer un modèle (Launch Model)

1. Sélectionnez la ressource **Model**.
2. Choisissez l'opération **Launch**.
3. Sélectionnez le modèle souhaité dans la liste déroulante (chargée dynamiquement).
4. (Optionnel) Ajoutez des variables supplémentaires dans le champ **Extravars Au Format JSON**.
* Exemple : `{"target_host": "webserver01", "action": "update"}`



### 2. Suivre un job (Get Status)

1. Sélectionnez la ressource **Job**.
2. Choisissez l'opération **Get Status**.
3. Renseignez le **Job ID** (récupéré généralement lors de l'étape de lancement).
4. Le nœud retournera un objet contenant :
* `job` : Les métadonnées sur l'exécution (status, start/end time, etc.).
* `stdout` : La sortie console brute du playbook.

---

## 📦 Installation (Développeur)

Pour intégrer ce nœud à votre installation n8n locale :

1. Copiez les fichiers du nœud dans votre dossier de nœuds personnalisés :
`~/.n8n/nodes/custom/`
2. Assurez-vous d'inclure le fichier `AnsibleAutomationPlatform_logo.svg` pour l'icône.
3. Redémarrez n8n.

---

## ⚠️ Erreurs communes

* **401 Unauthorized** : Vérifiez vos identifiants ou la validité de votre token OAuth2.
* **Connection Refused** : Vérifiez que l'URL du domaine ne se termine pas par un `/` inutile (bien que le code le gère automatiquement) et que l'instance est accessible depuis n8n.
* **JSON Parsing Error** : Assurez-vous que le champ `Extravars` contient un JSON valide.
