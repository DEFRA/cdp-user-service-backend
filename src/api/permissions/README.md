# Permissions

The permission system is a ReBAC (relational) style authorization model.

The `relationships` collection contains one document per relationship.

```
{
  "subject": (string) who the relationship applies to.
  "subjectType": (string) user|team
  "relation": (string) the relation between subject and resource
  "resource": (string) what the relationship is applied to
  "resourceType": (string) user|team|permission
}
```

The system can be used to represent different kinds of relationships.

```
- member
- granted
- breakglass
- Any other 'member' scoped permission
```

## Team membership

If a user is added to a team we create a new `member` relation:

```
{
  "subject": "$user_id",
  "subjectType": "user",
  "relation": "member",
  "resource": "$team_id",
  "resourceType": "team"
}
```

When finding members of a team we can query the relationship collection where `resource` matches our `teamId` and `relation` is `member` selecting the `subject`.

## Granting Permissions

We can grant permissions to either a user to team by creating a `grated` relationship.
The subject will be either a user or team ID, the relation `member` and the resource the name of the permission/scope.

```
  "subject": "$user_id",
  "subjectType": "user",
  "relation": "granted",
  "resource": "admin",
  "resourceType": "permission"
```

## Scopes for a user

When working out what scopes a user has, we do a `$graphLookup` on the relationship collection.

- Find all the records where `subject == $user_id` and `subjectType == 'user'`.
- Perform a graphLookup joining `resource` to `subject`
- Process the matched documents, mapping the relation & resource to the legacy scope types

This will grant the user permissions that are assigned directly to them as well as any permissions of teams they are members of.
It will also add some legacy scopes such as serviceOwner etc.

## Break glass and member scoped permissions

Member scopes permissions are represented slightly differently. Instead of `relation: granted` and a `resource` pointing to the permission,
we use the `scope id` as the `relation` and set the resource to the `team id` the permission is scoped to.

```
  "subject": "$user_id",
  "subjectType": "user",
  "relation": "breakglass",
  "resource": "platform-team",
  "resourceType": "team"
```

## Time limited permissions

A relationship document can have an optional `start` and `end` date field.
The `end` field is used in the TTL index, once it has expired the relationship will be deleted.
Additional checks are performed in queries to ensure that time limited permissions are only included when they are active.
