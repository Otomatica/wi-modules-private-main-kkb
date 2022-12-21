
create table pointList (
  id int not null identity,
  xid nvarchar(100) not null,
  name nvarchar(100) not null,
  context ntext,
  readPermissionId INT NOT NULL,
  editPermissionId INT NOT NULL,
  primary key (id)
);
alter table pointList add constraint pointListUn1 unique (xid);
alter table pointList add constraint pointListFk1 foreign key (readPermissionId) references permissions(id) on delete restrict;
alter table pointList add constraint pointListFk2 foreign key (editPermissionId) references permissions(id) on delete restrict;