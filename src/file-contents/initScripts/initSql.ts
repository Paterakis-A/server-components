export const initSqlContent = `
    SET PASSWORD FOR 'root'@'%' = PASSWORD('__MYSQL_ROOT_PASSWORD');
`.replace("__MYSQL_ROOT_PASSWORD", "${MYSQL_ROOT_PASSWORD}");
