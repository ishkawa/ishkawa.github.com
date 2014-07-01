desc "create a new post"
task :new_post do
  print "title: "
  title = STDIN.gets.chomp
  filename = "_posts/#{Time.now.strftime('%Y-%m-%d')}-#{Time.now.strftime('%s')}.md"

  if File.exist?(filename)
    abort("rake aborted!") if ask("#{filename} already exists. Do you want to overwrite?", ['y', 'n']) == 'n'
  end

  puts "creating new post: #{filename}"
  open(filename, 'w') do |post|
    post.puts "---"
    post.puts "layout: post"
    post.puts "title: \"#{title.gsub(/&/,'&amp;')}\""
    post.puts "date: #{Time.now.strftime('%Y-%m-%d %H:%M')}"
    post.puts "---"
  end
end

