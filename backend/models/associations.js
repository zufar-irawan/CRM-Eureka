// File: models/associations.js
import { Leads } from "./leads/leadsModel.js";
import { LeadComments } from "./leads/leadsCommentModel.js";
import { Tasks } from "./tasks/tasksModel.js";
import { TaskComments } from "./tasks/tasksCommentModel.js";
import { TaskResults } from "./tasks/tasksResultModel.js";
import { User } from "./usersModel.js";
import { Deals } from "./deals/dealsModel.js";
import { DealComments } from "./deals/dealsCommentModel.js";

export const setupAssociations = () => {
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
    
    // Existing Tasks associations
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
};

export { Tasks, TaskComments, TaskResults, Leads, LeadComments, User, Deals, DealComments };