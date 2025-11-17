// Gestion des produits
class ProductManager {
  constructor() {
    this.products = this.loadProducts();
    this.editingId = null;
    this.currentImageData = null;
    this.init();
  }

  // Initialisation
  init() {
    this.renderProducts();
    this.updateStats();
    this.setupEventListeners();
  }

  // Charger les produits depuis le localStorage
  loadProducts() {
    const stored = localStorage.getItem('products');
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Données d'exemple pour démonstration
    return [
      {
        id: '1',
        nom: 'Smartphone Samsung',
        prix: 699.99,
        quantite: 15,
        description: 'Smartphone Android avec écran 6.5" et triple caméra',
        imageData: null,
        disponible: true,
        categorie: 'electronique',
        devise: '€'
      },
      {
        id: '2',
        nom: 'T-shirt Cotton',
        prix: 24.99,
        quantite: 3,
        description: 'T-shirt 100% coton, différentes couleurs disponibles',
        imageData: null,
        disponible: true,
        categorie: 'vetements',
        devise: '€'
      },
      {
        id: '3',
        nom: 'Cafetière Programmable',
        prix: 89.99,
        quantite: 0,
        description: 'Cafetière avec minuterie et fonction keep warm',
        imageData: null,
        disponible: false,
        categorie: 'maison',
        devise: '€'
      }
    ];
  }

  // Sauvegarder les produits dans le localStorage
  saveProducts() {
    localStorage.setItem('products', JSON.stringify(this.products));
  }

  // Ajouter un produit
  addProduct(product) {
    this.products.push(product);
    this.saveProducts();
    this.renderProducts();
    this.updateStats();
  }

  // Mettre à jour un produit
  updateProduct(id, updatedProduct) {
    const index = this.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.products[index] = { ...this.products[index], ...updatedProduct };
      this.saveProducts();
      this.renderProducts();
      this.updateStats();
    }
  }

  // Supprimer un produit
  deleteProduct(id) {
    this.products = this.products.filter(p => p.id !== id);
    this.saveProducts();
    this.renderProducts();
    this.updateStats();
  }

  // Récupérer un produit par ID
  getProduct(id) {
    return this.products.find(p => p.id === id);
  }

  // Filtrer les produits
  filterProducts(searchTerm) {
    if (!searchTerm) return this.products;
    
    return this.products.filter(product => 
      product.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.categorie.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Gérer l'upload d'image
  handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      this.showNotification('Veuillez sélectionner une image valide', 'info');
      return;
    }

    // Vérifier la taille du fichier (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      this.showNotification('L\'image ne doit pas dépasser 2MB', 'info');
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      this.currentImageData = e.target.result;
      this.displayImagePreview(this.currentImageData);
    };
    
    reader.readAsDataURL(file);
  }

  // Afficher l'aperçu de l'image
  displayImagePreview(imageData) {
    const preview = document.getElementById('image-preview');
    preview.innerHTML = `
      <img src="${imageData}" alt="Aperçu de l'image">
      <button type="button" class="btn btn-danger btn-sm" onclick="productManager.removeImagePreview()" style="margin-top: 0.5rem;">
        <i class="fas fa-times"></i> Supprimer
      </button>
    `;
  }

  // Supprimer l'aperçu de l'image
  removeImagePreview() {
    this.currentImageData = null;
    const preview = document.getElementById('image-preview');
    preview.innerHTML = '<div class="preview-placeholder">Aucune image sélectionnée</div>';
    document.getElementById('image-upload').value = '';
  }

  // Rendu des produits
  renderProducts(filteredProducts = null) {
    const productsToRender = filteredProducts || this.products;
    const tbody = document.getElementById('product-list');
    
    if (productsToRender.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-state">
            <i class="fas fa-box-open"></i>
            <h3>Aucun produit trouvé</h3>
            <p>Commencez par ajouter votre premier produit</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = productsToRender.map(product => `
      <tr>
        <td>
          <div class="product-image">
            ${product.imageData ? 
              `<img src="${product.imageData}" alt="${product.nom}">` : 
              `<i class="fas fa-image"></i>`
            }
          </div>
        </td>
        <td>
          <strong>${product.nom}</strong>
          <div class="product-description">${product.description}</div>
        </td>
        <td>
          <span class="category-badge">${this.getCategoryLabel(product.categorie)}</span>
        </td>
        <td>${product.prix} ${product.devise}</td>
        <td>
          <span class="${product.quantite === 0 ? 'stock-out' : product.quantite <= 5 ? 'stock-low' : ''}">
            ${product.quantite}
          </span>
        </td>
        <td>
          <span class="status-badge ${product.disponible ? 'status-available' : 'status-unavailable'}">
            ${product.disponible ? 'Disponible' : 'Indisponible'}
          </span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon btn-edit" onclick="productManager.editProduct('${product.id}')">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon btn-delete" onclick="productManager.confirmDelete('${product.id}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // Obtenir le libellé de la catégorie
  getCategoryLabel(category) {
    const categories = {
      'electronique': 'Électronique',
      'vetements': 'Vêtements',
      'maison': 'Maison',
      'sport': 'Sport',
      'autre': 'Autre'
    };
    return categories[category] || category;
  }

  // Éditer un produit
  editProduct(id) {
    const product = this.getProduct(id);
    if (!product) return;

    this.editingId = id;
    this.currentImageData = product.imageData;
    
    // Remplir le formulaire
    document.getElementById('title').value = product.nom;
    document.getElementById('price').value = product.prix;
    document.getElementById('quantity').value = product.quantite;
    document.getElementById('description').value = product.description;
    document.getElementById('category').value = product.categorie;
    document.getElementById('available').value = product.disponible.toString();
    
    // Afficher l'image si elle existe
    if (product.imageData) {
      this.displayImagePreview(product.imageData);
    } else {
      this.removeImagePreview();
    }
    
    // Changer le texte du formulaire
    document.getElementById('form-title').textContent = 'Modifier le produit';
    document.getElementById('submit-btn').innerHTML = '<i class="fas fa-save"></i> Mettre à jour';
    document.getElementById('cancel-btn').style.display = 'block';
    
    // Faire défiler jusqu'au formulaire
    document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
  }

  // Annuler l'édition
  cancelEdit() {
    this.editingId = null;
    this.currentImageData = null;
    document.getElementById('product-form').reset();
    this.removeImagePreview();
    document.getElementById('form-title').textContent = 'Ajouter un produit';
    document.getElementById('submit-btn').innerHTML = '<i class="fas fa-plus-circle"></i> Ajouter le produit';
    document.getElementById('cancel-btn').style.display = 'none';
  }

  // Confirmer la suppression
  confirmDelete(id) {
    const product = this.getProduct(id);
    if (!product) return;

    const modal = document.getElementById('confirmation-modal');
    const message = document.getElementById('modal-message');
    
    message.textContent = `Êtes-vous sûr de vouloir supprimer "${product.nom}" ? Cette action est irréversible.`;
    
    modal.style.display = 'flex';
    
    // Gérer la confirmation
    document.getElementById('modal-confirm').onclick = () => {
      this.deleteProduct(id);
      modal.style.display = 'none';
      this.showNotification('Produit supprimé avec succès!', 'success');
    };
    
    // Gérer l'annulation
    document.getElementById('modal-cancel').onclick = () => {
      modal.style.display = 'none';
    };
  }

  // Mettre à jour les statistiques
  updateStats() {
    const total = this.products.length;
    const available = this.products.filter(p => p.disponible).length;
    const lowStock = this.products.filter(p => p.quantite > 0 && p.quantite <= 5).length;
    const outOfStock = this.products.filter(p => p.quantite === 0).length;

    document.getElementById('total-products').textContent = total;
    document.getElementById('available-products').textContent = available;
    document.getElementById('low-stock-products').textContent = lowStock;
    document.getElementById('out-of-stock-products').textContent = outOfStock;
  }

  // Exporter les données
  exportData() {
    const data = {
      produits: this.products,
      exportDate: new Date().toISOString(),
      totalProduits: this.products.length
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `produits-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    this.showNotification('Données exportées avec succès!', 'success');
  }

  // Configuration des écouteurs d'événements
  setupEventListeners() {
    const form = document.getElementById('product-form');
    const searchInput = document.getElementById('search-input');
    const exportBtn = document.getElementById('export-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const imageUpload = document.getElementById('image-upload');

    // Gestion du formulaire
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });

    // Upload d'image
    imageUpload.addEventListener('change', (e) => {
      this.handleImageUpload(e);
    });

    // Recherche en temps réel
    searchInput.addEventListener('input', (e) => {
      const filtered = this.filterProducts(e.target.value);
      this.renderProducts(filtered);
    });

    // Export des données
    exportBtn.addEventListener('click', () => {
      this.exportData();
    });

    // Annulation de l'édition
    cancelBtn.addEventListener('click', () => {
      this.cancelEdit();
    });

    // Fermer la modal en cliquant à l'extérieur
    window.addEventListener('click', (e) => {
      const modal = document.getElementById('confirmation-modal');
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }

  // Gestion de la soumission du formulaire
  handleFormSubmit() {
    const product = {
      nom: document.getElementById('title').value,
      prix: parseFloat(document.getElementById('price').value),
      quantite: parseInt(document.getElementById('quantity').value),
      description: document.getElementById('description').value,
      imageData: this.currentImageData,
      categorie: document.getElementById('category').value,
      disponible: document.getElementById('available').value === 'true',
      devise: '€'
    };

    if (this.editingId) {
      // Mise à jour
      product.id = this.editingId;
      this.updateProduct(this.editingId, product);
      this.cancelEdit();
      this.showNotification('Produit mis à jour avec succès!', 'success');
    } else {
      // Ajout
      product.id = Date.now().toString();
      this.addProduct(product);
      document.getElementById('product-form').reset();
      this.removeImagePreview();
      this.showNotification('Produit ajouté avec succès!', 'success');
    }
  }

  // Afficher une notification
  showNotification(message, type = 'info') {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check' : 'info'}-circle"></i>
      <span>${message}</span>
    `;

    document.body.appendChild(notification);

    // Animation d'entrée
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Supprimer après 3 secondes
    setTimeout(() => {
      notification.style.transform = 'translateX(150%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

// Initialisation de l'application
const productManager = new ProductManager();