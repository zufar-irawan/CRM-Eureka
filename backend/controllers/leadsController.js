import { Leads } from "../models/leadsModel";

export const getLeads = async (req, res) => {
    try {
        const leads = await Leads.findAll();
        res.json(leads);
    } catch (error) {
        res.status(500).json({ message: "Error fetching leads", error: error.message });
    }
};