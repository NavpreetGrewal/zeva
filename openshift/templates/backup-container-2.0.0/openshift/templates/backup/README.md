## Setup Backup container
Use backup container release 2.0.0 to run the backup, current folder is backup-container-2.0.0
1. Request netapp-file-backup storage as backup space
follow https://github.com/BCDevOps/provision-nfs-apb/blob/master/docs/usage-gui.md to request nfs-backup storage

2. Build patroni-backup image
oc -n e52f12-tools process -f ./openshift/templates/backup/backup-build.json \
-p NAME=patroni-backup OUTPUT_IMAGE_TAG=2.0.0 GIT_REF=2.0.0 \

| oc -n e52f12-tools create -f -
3. add to ./config/backup.conf, 9pm run backup, 10pm run verification
patroni-master-prod:5432/zeva
0 21 * * * default ./backup.sh -s
0 22 * * * default ./backup.sh -s -v all
4. create backup-conf configmap
oc -n e52f12-test create configmap backup-conf --from-file=./config/backup.conf
oc -n e52f12-prod create configmap backup-conf --from-file=./config/backup.conf
5. mount the netapp-file-backup storage to frontend pod and create /patroni-backup, /minio-backup and /rabbitmq-backup. remove the mount later
6. create deployment config for backup container
6.1 for test
BACKUP_VOLUME_NAME is pvc name
oc -n e52f12-test process -f ./templates/backup/backup-deploy.json \
  -p NAME=patroni-backup \
  -p SOURCE_IMAGE_NAME=patroni-backup \
  -p IMAGE_NAMESPACE=e52f12-tools \
  -p TAG_NAME=2.2.1 \
  -p DATABASE_SERVICE_NAME=patroni-master-test \
  -p DATABASE_NAME=zeva \
  -p DATABASE_DEPLOYMENT_NAME=patroni-test \
  -p DATABASE_USER_KEY_NAME=app-db-username \
  -p DATABASE_PASSWORD_KEY_NAME=app-db-password \
  -p TABLE_SCHEMA=public \
  -p BACKUP_STRATEGY=rolling \
  -p DAILY_BACKUPS=31 \
  -p WEEKLY_BACKUPS=12 \
  -p MONTHLY_BACKUPS=3 \
  -p BACKUP_PERIOD=1d \
  -p BACKUP_VOLUME_NAME=backup-zeva-test \
  -p VERIFICATION_VOLUME_NAME=backup-verification \
  -p VERIFICATION_VOLUME_SIZE=2G \
  -p VERIFICATION_VOLUME_CLASS=netapp-file-standard \
  -p ENVIRONMENT_FRIENDLY_NAME='ZEVA Database Backup' \
  -p ENVIRONMENT_NAME=zeva-test \
  -p MINIO_DATA_VOLUME_NAME=zeva-minio-test | \
  oc create -f - -n e52f12-test
6.2 for production
BACKUP_VOLUME_NAME is the nfs storage name
oc -n e52f12-prod process -f ./templates/backup/backup-deploy.json \
  -p NAME=patroni-backup \
  -p SOURCE_IMAGE_NAME=patroni-backup \
  -p IMAGE_NAMESPACE=e52f12-tools \
  -p TAG_NAME=2.2.1 \
  -p DATABASE_SERVICE_NAME=patroni-master-prod \
  -p DATABASE_NAME=zeva \
  -p DATABASE_DEPLOYMENT_NAME=patroni-prod \
  -p DATABASE_USER_KEY_NAME=app-db-username \
  -p DATABASE_PASSWORD_KEY_NAME=app-db-password \
  -p TABLE_SCHEMA=public \
  -p BACKUP_STRATEGY=rolling \
  -p DAILY_BACKUPS=31 \
  -p WEEKLY_BACKUPS=12 \
  -p MONTHLY_BACKUPS=3 \
  -p BACKUP_PERIOD=1d \
  -p BACKUP_VOLUME_NAME=backup-zeva-prod \
  -p VERIFICATION_VOLUME_NAME=backup-verification \
  -p VERIFICATION_VOLUME_SIZE=2G \
  -p VERIFICATION_VOLUME_CLASS=netapp-file-standard \
  -p ENVIRONMENT_FRIENDLY_NAME='ZEVA Database Backup' \
  -p ENVIRONMENT_NAME=zeva-prod \
  -p MINIO_DATA_VOLUME_NAME=zeva-minio-prod | \
  oc create -f - -n e52f12-prod
7. If need to remove, only keeps configmap/backup-conf and the the nfs storage
oc -n e52f12-prod delete secret/patroni-backup secret/ftp-secret dc/patroni-backup pvc/backup-verification 