
create table graphView (
  id int not null identity,
  xid nvarchar(100) not null,
  name nvarchar(100) not null,
  context ntext,
  primary key (id)
);
alter table graphView add constraint graphViewUn1 unique (xid);