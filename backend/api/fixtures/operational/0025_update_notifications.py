from django.db import transaction

from api.management.data_script import OperationalDataScript
from api.models.notification import Notification
from api.models.permission import Permission


class UpdateNotifications(OperationalDataScript):
    """
    Update notifications permission
    """
    is_revertable = False
    comment = 'Update notifications permission'

    def check_run_preconditions(self):
        return True
    def update_notifications(self):
        permission = Permission.objects.get(permission_code="VIEW_BCEID_NOTIFICATIONS")
        notification = Notification.objects.get(notification_code="CREDIT_APPLICATION_ISSUED")
        notification.permission = permission
        notification.save()
        notification = Notification.objects.get(notification_code="CREDIT_TRANSFER_APPROVED_PARTNER")
        notification.permission = permission
        notification.save()
        notification = Notification.objects.get(notification_code="CREDIT_TRANSFER_RECORDED")
        notification.permission = permission
        notification.save()
        notification = Notification.objects.get(notification_code="CREDIT_TRANSFER_REJECTED_PARTNER")
        notification.permission = permission
        notification.save()
        notification = Notification.objects.get(notification_code="CREDIT_TRANSFER_REJECTED")
        notification.permission = permission
        notification.save()
        notification = Notification.objects.get(notification_code="CREDIT_TRANSFER_RESCINDED_PARTNER")
        notification.permission = permission
        notification.save()
        notification = Notification.objects.get(notification_code="CREDIT_TRANSFER_SUBMITTED")
        notification.permission = permission
        notification.save()
        notification = Notification.objects.get(notification_code="ZEV_MODEL_REJECTED")
        notification.permission = permission
        notification.save()
        notification = Notification.objects.get(notification_code="ZEV_MODEL_RANGE_REPORT_TEST_RESULT_REQUESTED")
        notification.permission = permission
        notification.save()
        notification = Notification.objects.get(notification_code="ZEV_MODEL_VALIDATED")
        notification.permission = permission
        notification.save()

    @transaction.atomic
    def run(self):
        self.update_notifications()


script_class = UpdateNotifications
