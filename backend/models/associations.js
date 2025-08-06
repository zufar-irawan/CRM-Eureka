// File: models/associations.js - Updated with proper foreign key associations including roles
import { Leads } from "./leads/leadsModel.js";
import { LeadComments } from "./leads/leadsCommentModel.js";
import { Tasks } from "./tasks/tasksModel.js";
import { TaskComments } from "./tasks/tasksCommentModel.js";
import { TaskResults } from "./tasks/tasksResultModel.js";
import { User } from "./usersModel.js";
import { Role, UserRole } from "./rolesModel.js"; // Import dari file terpisah
import { Deals } from "./deals/dealsModel.js";
import { DealComments } from "./deals/dealsCommentModel.js";
import { Companies } from "./companies/companiesModel.js";
import { Contacts } from "./contacts/contactsModel.js";

export const setupAssociations = () => {
    // User and Role associations (Many-to-Many)
    User.belongsToMany(Role, {
        through: UserRole,
        foreignKey: 'user_id',
        otherKey: 'role_id',
        as: 'roles'
    });

    Role.belongsToMany(User, {
        through: UserRole,
        foreignKey: 'role_id',
        otherKey: 'user_id',
        as: 'users'
    });

    // Direct associations for UserRole
    User.hasMany(UserRole, {
        foreignKey: 'user_id',
        as: 'userRoles'
    });

    UserRole.belongsTo(User, {
        foreignKey: 'user_id',
        as: 'user'
    });

    UserRole.belongsTo(Role, {
        foreignKey: 'role_id',
        as: 'role'
    });

    // Leads associations
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

    // Tasks associations
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

    // Deals associations
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

    // Companies and Contacts associations
    Companies.hasMany(Contacts, {
        foreignKey: 'company_id',
        as: 'contacts'
    });
    Contacts.belongsTo(Companies, {
        foreignKey: 'company_id',
        as: 'company'
    });
    Companies.hasMany(Deals, {
        foreignKey: 'id_company',
        as: 'deals'
    });
    Deals.belongsTo(Companies, {
        foreignKey: 'id_company',
        as: 'company',
        constraints: false 
    });
    Contacts.hasMany(Deals, {
        foreignKey: 'id_contact',
        as: 'deals'
    });
    Deals.belongsTo(Contacts, {
        foreignKey: 'id_contact',
        as: 'contact',
        constraints: false 
    });

    console.log('All associations have been set up successfully');
};

export { 
    Tasks, 
    TaskComments, 
    TaskResults, 
    Leads, 
    LeadComments, 
    User, 
    Role,
    UserRole,
    Deals, 
    DealComments,
    Companies,
    Contacts
};