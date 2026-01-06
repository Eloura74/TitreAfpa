const Service = require("../models/Service");

// Récupérer tous les services
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.status(200).json(services);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des services", error });
  }
};

// Créer un nouveau service
exports.createService = async (req, res) => {
  try {
    const { titre, description, prix, images, categorie } = req.body;
    const newService = new Service({
      titre,
      description,
      prix,
      images,
      categorie,
    });
    const savedService = await newService.save();
    res.status(201).json(savedService);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Erreur lors de la création du service", error });
  }
};

// Mettre à jour un service
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedService = await Service.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedService) {
      return res.status(404).json({ message: "Service non trouvé" });
    }
    res.status(200).json(updatedService);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Erreur lors de la mise à jour du service", error });
  }
};

// Supprimer un service
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedService = await Service.findByIdAndDelete(id);
    if (!deletedService) {
      return res.status(404).json({ message: "Service non trouvé" });
    }
    res.status(200).json({ message: "Service supprimé avec succès" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression du service", error });
  }
};
