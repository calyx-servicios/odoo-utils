from odoo import fields, models, tools, _
from odoo.exceptions import AccessError, MissingError
from odoo.tools import frozendict
from collections import defaultdict


class IrActions(models.Model):
    _inherit = 'ir.actions.actions'
    
    excl_groups_id = fields.Many2many(
        comodel_name='res.groups',
        relation="ir_action_excl_group_rel",
        string='Excluded Groups',
    )

    @tools.ormcache('model_name', 'self.env.lang')
    def _get_bindings(self, model_name):
        cr = self.env.cr

        # discard unauthorized actions, and read action definitions
        result = defaultdict(list)

        self.env.flush_all()
        cr.execute("""
            SELECT a.id, a.type, a.binding_type
              FROM ir_actions a
              JOIN ir_model m ON a.binding_model_id = m.id
             WHERE m.model = %s
          ORDER BY a.id
        """, [model_name])
        for action_id, action_model, binding_type in cr.fetchall():
            try:
                action = self.env[action_model].sudo().browse(action_id)
                fields = ['name', 'binding_view_types']
                for field in ('groups_id', 'res_model', 'sequence'):
                    if field in action._fields:
                        fields.append(field)
                excl_groups_id = action.excl_groups_id
                action = action.read(fields)[0]
                if action.get('groups_id'):
                    groups = self.env['res.groups'].browse(action['groups_id'])
                    action['groups_id'] = ','.join(ext_id for ext_id in groups._ensure_xml_id().values())
                if excl_groups_id:
                    groups = action.get("groups_id", "")
                    groups = ','.join(f"!{ext_id}" for ext_id in excl_groups_id._ensure_xml_id().values())
                    action['groups_id'] = groups
                result[binding_type].append(frozendict(action))
            except (MissingError):
                continue

        # sort actions by their sequence if sequence available
        if result.get('action'):
            result['action'] = tuple(sorted(result['action'], key=lambda vals: vals.get('sequence', 0)))
        return frozendict(result)
    
    def _get_readable_fields(self):
        return super()._get_readable_fields() | {"excl_groups_id"}
    

class IrActionsActWindow(models.Model):
    _inherit = 'ir.actions.act_window'
    
    excl_groups_id = fields.Many2many(
        comodel_name='res.groups',
        relation="ir_action_window_excl_group_rel",
        string='Excluded Groups',
    )


class IrActionsActWindowclose(models.Model):
    _inherit = 'ir.actions.act_window_close'
    
    excl_groups_id = fields.Many2many(
        comodel_name='res.groups',
        relation="ir_action_window_close_excl_group_rel",
        string='Excluded Groups',
    )


class IrActionsActUrl(models.Model):
    _inherit = 'ir.actions.act_url'
    
    excl_groups_id = fields.Many2many(
        comodel_name='res.groups',
        relation="ir_action_url_excl_group_rel",
        string='Excluded Groups',
    )
    

class IrActionsServer(models.Model):
    _inherit = 'ir.actions.server'
    
    excl_groups_id = fields.Many2many(
        comodel_name='res.groups',
        relation="ir_action_server_excl_group_rel",
        string='Excluded Groups',
    )
    
    def run(self):
        for action in self.sudo():
            # If we have an excluded group we cant run the action
            if action.excl_groups_id & self.env.user.groups_id:
                raise AccessError(_("You don't have enough access rights to run this action."))
        return super().run()


class IrActionsActClient(models.Model):
    _inherit = 'ir.actions.client'
    
    excl_groups_id = fields.Many2many(
        comodel_name='res.groups',
        relation="ir_action_client_excl_group_rel",
        string='Excluded Groups',
    )
    

class IrActionsReport(models.Model):
    _inherit = 'ir.actions.report'
    
    excl_groups_id = fields.Many2many(
        comodel_name='res.groups',
        relation="ir_action_report_excl_group_rel",
        string='Excluded Groups',
    )