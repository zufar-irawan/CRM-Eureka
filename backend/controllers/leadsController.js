import { Leads } from "../models/leadsModel.js";

export const getLeads = async (req, res) => {
    try {
        const response = await Leads.findAll();
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getLeadById = async (req, res) => {
    try {
        const response = await Leads.findOne({
            where: {
                id: parseInt(req.params.id)
            }
        });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};