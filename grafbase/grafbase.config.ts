import { config, connector, graph,auth } from '@grafbase/sdk'

const g = graph.Standalone()

const mongodb = connector.MongoDB('MongoDB', {
  url: g.env('MONGODB_API_URL'),
  apiKey: g.env('MONGODB_API_KEY'),
  dataSource: g.env('MONGODB_DATASOURCE'),
  database: g.env('MONGODB_DATABASE'),
})

g.datasource(mongodb)

//@ts-ignore

const project = g.type('Project', {
  title: g.string(),
  description : g.string(),
  image: g.url(),
  liveSiteUrl: g.url(),
  githubUrl: g.url(),
  category: g.string(),
  // category: g.string().search(),
})

mongodb.model('User', {
  name: g.string().length({min:2,max:20}),
  email:g.string().unique(),
  avatarUrl: g.url(),
  description: g.string().optional(),
  githubUrl: g.url().optional(),
  linkedINUrl: g.url().optional(),
  projects : g.ref(project).list().optional(),
}).auth((rules)=>{
  rules.public().read()
}).collection('users')

const user  = g.type('User', {
  name: g.string(),
  email:g.string(),
  avatarUrl: g.url(),
  description: g.string().optional(),
  githubUrl: g.url().optional(),
  linkedINUrl: g.url().optional(),
})

//@ts-ignore
mongodb.model('Project', {
  title: g.string().length({min:3}),
  description : g.string(),
  image: g.url(),
  liveSiteUrl: g.url(),
  githubUrl: g.url(),
  category: g.string(),
  // category: g.string().search(),
  createdBy: g.ref(user),
}).auth((rules)=>{
  rules.public().read(),
  rules.private().create().update().delete();
}).collection('projects')

const jwt = auth.JWT({
  issuer:'grafbase',
  secret:g.env('NEXTAUTH_SECRET')
})

export default config({
  schema: g,
  auth:{
    providers:[jwt],
    rules : (rules)=> rules.private()
  }
})
