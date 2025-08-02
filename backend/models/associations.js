// File: models/associations.js - Updated with proper foreign key associations
import { Leads } from "./leads/leadsModel.js";
import { LeadComments } from "./leads/leadsCommentModel.js";
import { Tasks } from "./tasks/tasksModel.js";
import { TaskComments } from "./tasks/tasksCommentModel.js";
import { TaskResults } from "./tasks/tasksResultModel.js";
import { User } from "./usersModel.js";
import { Deals } from "./deals/dealsModel.js";
import { DealComments } from "./deals/dealsCommentModel.js";
import { Companies } from "./companies/companiesModel.js";
import { Contacts } from "./contacts/contactsModel.js";

export const setupAssociations = () => {
    // Lead associations
    Leads.hasMany(LeadComments, {
        foreignKey: 'lead_id',
        as: 'comments'
    });
    LeadComments.belongsTo(Leads, {
        foreignKey: 'lead_id',
        as: 'lead'
    });
    
    Leads.hasMany(Tasks, {
        foreignKey: 'lead_id',
        as: 'tasks'
    });
    Tasks.belongsTo(Leads, {
        foreignKey: 'lead_id',
        as: 'lead'
    });
    
    Leads.belongsTo(User, {
        foreignKey: 'owner',
        as: 'lead_owner'
    });
    
    LeadComments.belongsTo(User, {
        foreignKey: 'user_id',
        as: 'user'
    });
    
    // Task associations
    Tasks.belongsTo(User, {
        foreignKey: 'assigned_to',
        as: 'assignee'
    });
    
    Tasks.hasMany(TaskComments, {
        foreignKey: 'task_id',
        as: 'comments',
        onDelete: 'CASCADE'
    });
    TaskComments.belongsTo(Tasks, {
        foreignKey: 'task_id',
        as: 'task'
    });
    
    Tasks.hasMany(TaskResults, {
        foreignKey: 'task_id',
        as: 'results',
        onDelete: 'CASCADE'
    });
    TaskResults.belongsTo(Tasks, {
        foreignKey: 'task_id',
        as: 'task'
    });

    // Deal associations with Lead and User
    Leads.hasMany(Deals, {
        foreignKey: 'lead_id',
        as: 'deals'
    });
    Deals.belongsTo(Leads, {
        foreignKey: 'lead_id',
        as: 'lead'
    });
    
    User.hasMany(Deals, {
        foreignKey: 'created_by',
        as: 'created_deals'
    });
    Deals.belongsTo(User, {
        foreignKey: 'created_by',
        as: 'creator'
    });
    
    Deals.hasMany(DealComments, {
        foreignKey: 'deal_id',
        as: 'comments',
        onDelete: 'CASCADE'
    });
    DealComments.belongsTo(Deals, {
        foreignKey: 'deal_id',
        as: 'deal'
    });
    
    User.hasMany(DealComments, {
        foreignKey: 'user_id',
        as: 'deal_comments'
    });
    DealComments.belongsTo(User, {
        foreignKey: 'user_id',
        as: 'user'
    });

    // Company and Contact associations
    Companies.hasMany(Contacts, {
        foreignKey: 'company_id',
        as: 'contacts'
    });
    Contacts.belongsTo(Companies, {
        foreignKey: 'company_id',
        as: 'company'
    });

    // UPDATED: Deal relationships with Company and Contact
    // Companies can have many deals
    Companies.hasMany(Deals, {
        foreignKey: 'id_company',
        as: 'deals'
    });
    // Deal belongs to Company (optional relationship)
    Deals.belongsTo(Companies, {
        foreignKey: 'id_company',
        as: 'company',
        constraints: false // Allow NULL values
    });

    // Contacts can have many deals
    Contacts.hasMany(Deals, {
        foreignKey: 'id_contact',
        as: 'deals'
    });
    // Deal belongs to Contact (optional relationship)
    Deals.belongsTo(Contacts, {
        foreignKey: 'id_contact',
        as: 'contact',
        constraints: false // Allow NULL values
    });

    console.log('✅ All associations have been set up successfully');
};

export { 
    Tasks, 
    TaskComments, 
    TaskResults, 
    Leads, 
    LeadComments, 
    User, 
    Deals, 
    DealComments,
    Companies,
    Contacts
};