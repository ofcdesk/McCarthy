export interface Submittal {
  id: number;
  number: string;
  revision: string;
  title: string;
  approvers: any[];
  attachments_count: number;
  ball_in_court: BallInCourt[];
  created_at: string;
  created_by: CreatedBy;
  current_revision: boolean;
  custom_fields: CustomFields;
  distributed_at: any;
  due_date: any;
  formatted_number: string;
  issue_date: any;
  private: boolean;
  received_date: any;
  received_from: any;
  specification_section: any;
  submit_by: any;
  submittal_manager: SubmittalManager;
  submittal_package: any;
  type: any;
  updated_at: string;
  open_date: any;
  is_rejected: boolean;
  rejected_submittal_log_approver_id: any;
  actual_delivery_date: any;
  confirmed_delivery_date: any;
  custom_textarea_1: any;
  custom_textfield_1: any;
  description: any;
  design_team_review_time: any;
  distribution_members: any[];
  distributed_submittals: any[];
  internal_review_time: any;
  lead_time: any;
  prepare_time: any;
  required_on_site_date: any;
  rich_text_description: any;
  scheduled_task: any;
  source_submittal_log_id: number;
  location: any;
  responsible_contractor: any;
  sub_job: any;
  status: Status;
  attachments: any[];
  cost_code: any;
}

export interface BallInCourt {
  id: number;
  name: string;
  locale: any;
  login: string;
}

export interface CreatedBy {
  id: number;
  name: string;
  locale: any;
  login: string;
}

export interface CustomFields {}

export interface SubmittalManager {
  id: number;
  name: string;
  locale: any;
  login: string;
}

export interface Status {
  id: number;
  name: string;
  status: string;
}
