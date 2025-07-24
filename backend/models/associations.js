// File: models/associations.js
import { Leads } from "./leadsModel.js";
import { LeadComments } from "./leadsCommentModel.js";
import { Tasks } from "./tasksModel.js";
import { User } from "./usersModel.js";
import { TaskComments } from './tasksCommentModel.js';  
import { TaskResults } from './tasksResultModel.js';    

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
    
    console.log('All associations have been set up successfully!');
};

export { Tasks, TaskComments, TaskResults, Leads, LeadComments, User };