
create table graphView (
  id int not null auto_increment,
  xid varchar(100) not null,
  name varchar(100) not null,
  context longtext,
  primary key (id)
);
alter table graphView add constraint graphViewUn1 unique (xid);