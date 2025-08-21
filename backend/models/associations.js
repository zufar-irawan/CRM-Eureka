// models/associations.js - Updated dengan KPI models
import { Leads } from "./leads/leadsModel.js";
import { LeadComments } from "./leads/leadsCommentModel.js";
import { Tasks } from "./tasks/tasksModel.js";
import { TaskComments } from "./tasks/tasksCommentModel.js";
import { TaskResults } from "./tasks/tasksResultModel.js";
import { User } from "./usersModel.js";
import { Role, UserRole } from "./rolesModel.js"; 
import { Deals } from "./deals/dealsModel.js";
import { DealComments } from "./deals/dealsCommentModel.js";
import { Companies } from "./companies/companiesModel.js";
import { Contacts } from "./contacts/contactsModel.js";
import { TaskAttachments } from "./tasks/tasksAttachmentModel.js"; 
import { SalesKpiDaily, SalesKpiMonthly, KpiTargets } from "../models/kpi/kpiModel.js";

export const setupAssociations = () => {
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

    LeadComments.hasMany(LeadComments, {
        foreignKey: 'parent_id',
        as: 'leadReplies',
        onDelete: 'CASCADE'
    });

    LeadComments.belongsTo(LeadComments, {
        foreignKey: 'parent_id',
        as: 'leadParent',
        onDelete: 'CASCADE'
    });

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

    TaskComments.belongsTo(User, {
        foreignKey: 'commented_by',
        as: 'commentedByUser',
        constraints: false
    });
    User.hasMany(TaskComments, {
        foreignKey: 'commented_by',
        as: 'taskComments'
    });

    TaskResults.belongsTo(User, {
        foreignKey: 'created_by',
        as: 'creator',
        constraints: false
    });
    User.hasMany(TaskResults, {
        foreignKey: 'created_by',
        as: 'taskResults'
    });

    TaskResults.hasMany(TaskAttachments, {
        foreignKey: 'task_result_id',
        as: 'attachments',
        onDelete: 'CASCADE'
    });
    TaskAttachments.belongsTo(TaskResults, {
        foreignKey: 'task_result_id',
        as: 'task_result'
    });
    
    TaskAttachments.belongsTo(User, {
        foreignKey: 'upload_by',
        as: 'uploader',
        constraints: false
    });
    User.hasMany(TaskAttachments, {
        foreignKey: 'upload_by',
        as: 'uploaded_attachments'
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

    DealComments.hasMany(DealComments, {
        foreignKey: 'parent_id',
        as: 'dealReplies',
        onDelete: 'CASCADE'
    });

    DealComments.belongsTo(DealComments, {
        foreignKey: 'parent_id',
        as: 'dealParent',
        onDelete: 'CASCADE'
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
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
    });
    
    Contacts.hasMany(Deals, {
        foreignKey: 'id_contact',
        as: 'deals'
    });
    Deals.belongsTo(Contacts, {
        foreignKey: 'id_contact',
        as: 'contact',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
    });

    // 🔥 KPI ASSOCIATIONS
    
    // User to KPI Daily associations
    User.hasMany(SalesKpiDaily, {
        foreignKey: 'sales_id',
        as: 'daily_kpi'
    });
    SalesKpiDaily.belongsTo(User, {
        foreignKey: 'sales_id',
        as: 'sales_user'
    });

    // User to KPI Monthly associations
    User.hasMany(SalesKpiMonthly, {
        foreignKey: 'sales_id',
        as: 'monthly_kpi'
    });
    SalesKpiMonthly.belongsTo(User, {
        foreignKey: 'sales_id',
        as: 'sales_user'
    });


    console.log('All associations including KPI have been set up successfully');
};

export { 
    Tasks, 
    TaskComments, 
    TaskResults, 
    TaskAttachments,
    Leads, 
    LeadComments, 
    User, 
    Role,
    UserRole,
    Deals, 
    DealComments,
    Companies,
    Contacts,
    SalesKpiDaily,
    SalesKpiMonthly,
    KpiTargets
};